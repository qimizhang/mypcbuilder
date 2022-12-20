import json
import boto3
def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE'
    }
    client = boto3.client('cognito-idp')
    dynamodb = boto3.resource('dynamodb')
    dynamoClient = boto3.client('dynamodb')
    print(event)
    
    try:
        token = event['headers']['x-pcbuilder-token']
        config_id = event['headers']['config-id']
        
    except:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': 'Bad Request'
        }
    
    try:
        response = client.get_user(
            AccessToken= token
        )
    except:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': 'Invalid Access Token'
        }
        
    Usr_name = response['Username']
    print(Usr_name)
    username = Usr_name

    
    table = dynamodb.Table('user_configs2')
    

    
    table.delete_item(
        Key={
            'username':username,
            'config_id':config_id
        }
    )
    
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps('Hello from Lambda!')
    }
