import json
import boto3

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
    }
    sqs = boto3.client('sqs')
    print(event)
    
    body = json.loads(event['body'])
    
    try:
        level = body['level']
        budget = body['budget']
        connectionId = body['connectionId']
    except:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps('Bad Request')
        }

    # exmaple 
    # uid = "test0"
    # level = "gamer"
    # budget = "1500"

    response = sqs.send_message(
        QueueUrl="https://sqs.us-east-1.amazonaws.com/609045772876/reco_req",
        MessageBody=json.dumps({
            "level": level,
            "budget":budget,
            "connectionId": connectionId
        })
    )
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps('Messages have been put into SQS!')
    }
