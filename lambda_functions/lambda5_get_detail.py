import json
import boto3


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
    }
    try:
        token = event['headers']['x-pcbuilder-token']
        config_id = event['pathParameters']['config_id']
    except:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': 'Bad Request'
        }        
    cognitoClient = boto3.client('cognito-idp')
    dynamoClient = boto3.client('dynamodb')
    
    # Get username by access token
    try:
        user = cognitoClient.get_user(
            AccessToken= token
        )
    except:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': 'Invalid User Access Token'
        }
    username = user['Username']
    print(username)
    
    # Get Config by username and config_id in user_configs table
    response = dynamoClient.get_item(
        TableName='user_configs2',
        Key={
            'username': {
                'S': username
            },
            'config_id': {
                'S': config_id
            }
        }
    )
    # print(response)
    
    # response = dynamoClient.query(
    #     ExpressionAttributeValues={
    #         ':v1': {
    #             'S': username,
    #         },
    #         ':v2': {
    #             'S': config_id
    #         }
    #     },
    #     KeyConditionExpression='username = :v1 AND config_id = :v2',
    #     TableName='user_configs2',
    # )
    try:
        config = response['Item']
    except:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': 'Requested Config not found'
        }
    
    detail = dict()
    detail['config_id'] = config['config_id']['S']
    cats = ['CPU', 'GPU', 'RAM', 'SSD', 'HDD']
    keys = list()
    for cat in cats:
        key = dict()
        key['name'] = config[cat.lower()]
        key['category'] = dict()
        key['category']['S'] = cat
        keys.append(key)
        
    # Get details by name and category in hardware_info table
    items = dynamoClient.batch_get_item(
        RequestItems = {
            'hardware_info':{
                'Keys': keys
            }
        }
    )
    # print(items)
    for item in items['Responses']['hardware_info']:
        detail[item['category']['S']] = item
    # print(detail)
    
    # for cat in cats:
    #     item = dynamoClient.query(
    #         ExpressionAttributeNames={
    #           '#name': 'name',
    #         },
    #         ExpressionAttributeValues={
    #             ':n': config[cat.lower()],
    #             ':c': {
    #                 'S': cat
    #             }
    #         },
    #         KeyConditionExpression='#name = :n AND category = :c',
    #         TableName='hardware_info'
    #     )['Items']
    #     if len(item) > 0:
    #         detail[cat] = item[0]
    print(detail)
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(detail)
    }
