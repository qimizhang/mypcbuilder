import json
import boto3
import time
import requests
import re
from decimal import Decimal
from bs4 import BeautifulSoup
import pandas as pd

categories = ["RAM"] # "CPU", "GPU", "SSD", "HDD", "RAM", "USB"
BUCKET_FROM = "coms6998-userbenchmark-csv"
TABLE_TO = "hardware_info"
REGION = "us-east-1"
API_HOST = "https://api.rainforestapi.com/request"
API_KEY = ""
HEADER = ["Type", "Part", "Number", "Brand", "Model", "Rank", "Benchmark", "Samples", "URL"]

Ebay = "Ebay" 
Amazon = "Amazon"


def dynamodb_insert(record):
    db = boto3.resource('dynamodb')
    table = db.Table(TABLE_TO)
    resp = table.put_item(Item=record)
    return
    
    
def traverse(category, bucket=BUCKET_FROM, region = REGION):
    s3 = boto3.client("s3", region)
    key = category + "_UserBenchmarks.csv"
    response = s3.get_object(
        Bucket=bucket,
        Key=key
    )
    df = pd.read_csv(response['Body'])
    
    total_row = df.shape[0]
    for i in range(0, min(600, total_row)):
        hardware_type = df.iloc[i, 0]
        brand = df.iloc[i, 2]
        model = df.iloc[i, 3]
        if category=="CPU" and model.find("Ryzen") == -1 and model.find("Core") == -1:
            continue
        rank = df.iloc[i, 4]
        benchmark = df.iloc[i, 5]
        t = time.time()
        
        price = None
        ebay_url = None
        amazon_url = None
        # try:
        # resp = requests.get(url, headers=HEADERS)
        # page = BeautifulSoup(resp.text, "html.parser")
        buy_url = API_HOST
        params = {
            "api_key" : API_KEY,
            "type": "search",
            "amazon_domain": "amazon.com",
            "search_term": "+".join(model.split(' '))
        }
        resp = requests.get(API_HOST, params = params)
        search_results = resp.json()["search_results"]
        
        j = 0
        price1 = None
        price2 = None
        while price1 is None and j < 10:
            try:
                price1 = search_results[j]["prices"][0]['value']
                amazon_url = search_results[j]['link']
            except:
                j += 1
                continue
        
        while price2 is None and j < 10:
            try:
                price2 = search_results[j]["prices"][0]['value']
            except:
                j += 1
                continue
            
        price = min(price1, price2)
        # if len(buy_urls) > 1:
        #     url0 = buy_urls[0].attrs["href"]
        #     url1 = buy_urls[1].attrs["href"]
        #     price = min(buy_urls[0].text, buy_urls[1].text)
        #     if Ebay in url0:
        #         ebay_url = buy_urls[0].attrs["href"]
        #     elif Amazon in url0:
        #         amazon_url = buy_urls[0].attrs["href"]
        #     if Ebay in url1:
        #         ebay_url = buy_urls[1].attrs["href"]
        #     elif Amazon in url1:
        #         amazon_url = buy_urls[1].attrs["href"]

        # elif len(buy_urls) == 1:
        #     url0 = buy_urls[0].attrs["href"]
        #     price = buy_urls[0].text
        #     if Ebay in url0:
        #         ebay_url = buy_urls[0].attrs["href"]
        #     elif Amazon in url0:
        #         amazon_url = buy_urls[0].attrs["href"]

        # except:
        #     print("Error happened!")
        #     continue
        
        record = {
            'name': str(brand) + " " + str(model),
            'category': hardware_type,
            'brand': str(brand),
            'model': str(model),
            'benchmark': Decimal(str(benchmark)),
            'amazon_url': amazon_url,
            'price': Decimal(str(price)),
            'time': Decimal(str(t))
        }
        # print(record)
        dynamodb_insert(record)
        if i % 20 == 0:
            time.sleep(10)
            print("The ", i, "th records searched")
    print("Traverse finshed!")
    return


def new_traverse(category, bucket=BUCKET_FROM, region=REGION):
    s3 = boto3.client("s3", region)
    key = category + ".csv"
    response = s3.get_object(
        Bucket=bucket,
        Key=key
    )
    df = pd.read_csv(response['Body'])
    total_row = df.shape[0]
    print(category, " start!")
    for i in range(0, total_row):
        record = {
            'name': str(df.iloc[i, 0]),
            'category': str(df.iloc[i, 1]),
            'brand': str(df.iloc[i, 2]),
            'model': str(df.iloc[i, 3]),
            'benchmark': Decimal(str(df.iloc[i ,4])),
            'amazon_url': str(df.iloc[i, 5]),
            'price': Decimal(str(df.iloc[i, 6])),
            'time': Decimal(str(df.iloc[i, 7]))
        }
        dynamodb_insert(record)
        if i % 20 == 0:
            time.sleep(5)
            print("The ", i, "th records searched")
    print("Traverse finshed!")
    return
    
    

def lambda_handler(event, context):
    # TODO implement
    for category in categories:
        new_traverse(category)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
