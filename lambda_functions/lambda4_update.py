import json
import boto3
def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
    }
    client = boto3.client('cognito-idp')
    dynamodb = boto3.resource('dynamodb')
    print(event)
    
    try:
        token = event['headers']['x-pcbuilder-token']
        config_id = event['pathParameters']['config_id']
        
    except:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': 'Bad Request'
        }
    hardware = json.loads(event['body'])['config']
    
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
    
    table = dynamodb.Table('user_configs2')
    print(table.creation_date_time)
    
    table.put_item(
       Item={
            'username': Usr_name,
            'cpu': hardware['CPU'],
            'gpu': hardware['GPU'],
            'hdd': hardware['HDD'],
            'ram': hardware['RAM'],
            'ssd': hardware['SSD'],
            'config_id': config_id
        }
    )
    

    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps('Hello from Lambda!')
    }
