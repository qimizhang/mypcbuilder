import json
import boto3
import functools

TABLE_HARDWARE = "hardware_info"
STUDENT = "student"
COMMON_U = "common_user"
GAMMER = "gamer"
Categories = ["CPU", "GPU", "RAM", "SSD", "HDD"]
Ratio = {
  STUDENT: {
      "CPU": 0.40,
      "GPU": 0.35,
      "SSD": 0.10,
      "HDD": 0.05,
      "RAM": 0.10
  },
  COMMON_U: {
      "CPU": 0.55,
      "GPU": 0.10,
      "SSD": 0.18,
      "HDD": 0.11,
      "RAM": 0.06
  },
  GAMMER: {
      "CPU": 0.24,
      "GPU": 0.60,
      "SSD": 0.08,
      "HDD": 0.05,
      "RAM": 0.10
  }
}


def get_hardwares(category, budget):
    db = boto3.client('dynamodb')
    dynamodb_response = db.scan(
        TableName = TABLE_HARDWARE,
        ScanFilter={
            'category': {
                "AttributeValueList": [{
                    "S": str(category)
                }],
                "ComparisonOperator": "EQ"
            },
            'price': {
                "AttributeValueList": [{
                    "N": str(budget)
                }],
                "ComparisonOperator": "LE"
            }
        }
        )
        
    result_list = dynamodb_response["Items"]
    result_list.sort(key=functools.cmp_to_key(compare), reverse=True)
    
    # print(result_list[0: 5])
    return result_list[0: 5]


def compare(x, y):
    if float(x['benchmark']['N']) > float(y['benchmark']['N']):
        return 1
    elif float(x['benchmark']['N']) < float(y['benchmark']['N']) :
        return -1
    else:
        return 0



def delete_recent_sqs(receipt_handle):
    sqs = boto3.client('sqs')
    response = sqs.get_queue_url(
        QueueName='reco_req',
        QueueOwnerAWSAccountId='609045772876'
    )
    queueUrl = response['QueueUrl']
    sqs.delete_message(
        QueueUrl=queueUrl,
        ReceiptHandle=receipt_handle
    )
    
def getBudget(level, category_index, budget):
    totalRatio = 0
    for i in range(category_index, len(Categories)):
        totalRatio += Ratio[level][Categories[i]]
    print(budget)
    print(Ratio[level][Categories[category_index]])
    print(totalRatio)
    return float(budget)*float(Ratio[level][Categories[category_index]])/float(totalRatio)
    

def lambda_handler(event, context):
    # TODO implement
    print("event is: ", event)
    record = event['Records'][0]
    budget = json.loads(record['body'])["budget"]
    user_type = json.loads(record['body'])["level"]
    connectionId = json.loads(record['body'])["connectionId"]
    
    receipt_handle = record["receiptHandle"]
    delete_recent_sqs(receipt_handle)
    
    all_list = {}
    rest_budget = float(budget)
    
    cpu_budget = float(budget)*Ratio[user_type]["CPU"]
    all_list['CPU'] = get_hardwares("CPU", cpu_budget)
    
    rest_budget -= float(all_list['CPU'][0]['price']['N'])
    gpu_budget = getBudget(user_type, 1, rest_budget)
    all_list['GPU'] = get_hardwares("GPU", gpu_budget)
    
    rest_budget -= float(all_list['GPU'][0]['price']['N'])
    ram_budget = getBudget(user_type, 2, rest_budget)
    all_list['RAM'] = get_hardwares("RAM", ram_budget)
    
    rest_budget -= float(all_list['RAM'][0]['price']['N'])  
    ssd_budget = getBudget(user_type, 3, rest_budget)
    all_list['SSD'] = get_hardwares("SSD", ssd_budget)
    
    rest_budget -= float(all_list['SSD'][0]['price']['N'])
    hdd_budget = getBudget(user_type, 4, rest_budget)
    all_list['HDD'] = get_hardwares("HDD", hdd_budget)
    # all_list['GPU'] = get_hardwares("GPU", float(budget)*Ratio[user_type]["GPU"])
    # all_list['SSD'] = get_hardwares("SSD", float(budget)*Ratio[user_type]["SSD"])
    # all_list['HDD'] = get_hardwares("HDD", float(budget)*Ratio[user_type]["HDD"])
    # all_list['RAM'] = get_hardwares("RAM", float(budget)*Ratio[user_type]["RAM"])
    
    simplified_all_list = {}
    simplified_all_list["CPU"] = [i['name']['S'] for i in all_list['CPU']]
    simplified_all_list["GPU"] = [i['name']['S'] for i in all_list['GPU']]
    simplified_all_list["RAM"] = [i['name']['S'] for i in all_list['RAM']]
    simplified_all_list["SSD"] = [i['name']['S'] for i in all_list['SSD']]
    simplified_all_list["HDD"] = [i['name']['S'] for i in all_list['HDD']]
    
    modelMarks = {}
    modelPrice ={}
    modelUrl = {}
    for category in Categories:
        for modelDetail in all_list[category]:
            modelName = modelDetail['name']['S']
            modelPrice[modelName] = float(modelDetail['price']['N'])
            modelUrl[modelName] = modelDetail['amazon_url']['S']
            modelMarks[modelName] = float(modelDetail['benchmark']['N'])


    recommendation_result = {
        "models": simplified_all_list,
        "Price": modelPrice,
        "URL": modelUrl,
        "benchmark": modelMarks
    }
    
    print(recommendation_result)
    
    connection = boto3.client('apigatewaymanagementapi', endpoint_url='https://bw6jp4efqf.execute-api.us-east-1.amazonaws.com/test')
    connection.post_to_connection(Data=json.dumps(recommendation_result).encode(encoding='UTF-8'), ConnectionId=connectionId)
    
    return {
        'statusCode': 200,
        'body': recommendation_result
    }
