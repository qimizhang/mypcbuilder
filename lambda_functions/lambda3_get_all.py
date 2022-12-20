import json
import boto3


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
    }
    try:
        token = event['headers']['x-pcbuilder-token']
    except:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': 'Bad Request'
        }
    cognitoClient = boto3.client('cognito-idp')
    dynamoClient = boto3.client('dynamodb')
    
    print(token)
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
    
    response = dynamoClient.query(
        ExpressionAttributeValues={
            ':v1': {
                'S': username,
            },
        },
        KeyConditionExpression='username = :v1',
        TableName='user_configs2',
    )
    
    print(response)
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(response['Items'])
    }
