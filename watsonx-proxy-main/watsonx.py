import requests, logging, time, os
from flask import jsonify

from db import db, CacheToken

TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"

# WATSONX_URL = "https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29"


class Watsonx():
    def __init__(self):
        self.access_token = self.get_token()

    # This function checks if cache still has valid access token, else calls fetch_token method to get new token
    def get_token(self) -> str:
        current_epoch_time = int(time.time())

        db_token = db.session.execute(
            db.Select(CacheToken).where(CacheToken.access_key == os.environ.get('API_KEY'))).scalar()

        # new_access_token = ""
        if db_token is None:
            # Getting the token first time. Insert record in table
            new_token = self.__class__.fetch_token()

            new_access_token = new_token['access_token']
            cache_token = CacheToken(
                access_key=os.environ.get('API_KEY'),
                token=new_token['access_token'],
                expiry=new_token['expiration']
            )
            db.session.add(cache_token)
            db.session.commit()
        elif current_epoch_time > db_token.expiry:
            new_token = self.__class__.fetch_token()

            new_access_token = new_token['access_token']
            db_token.token = new_token['access_token']
            db_token.expiry = new_token['expiration']
            db.session.commit()
        else:
            new_access_token = db_token.token

        return new_access_token

    # This function generates new token
    @staticmethod
    def fetch_token():
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        params = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": os.environ.get('API_KEY')  # API_KEY
        }
        try:
            response = requests.post(url=TOKEN_URL, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error while getting access token: {str(e)}")
            return ""

    def ask_watsonx(self, payload_in):
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }

        try:
            response = requests.post(url=os.environ.get("WATSONX_URL"), headers=headers, json=payload_in)
            response_headers = [(key, value) for (key, value) in response.headers.items()]
            response_json = response.json()
            return jsonify(response_json)

        except requests.exceptions.RequestException as e:
            logging.error({str(e)})
            response = str(e)
            return response
