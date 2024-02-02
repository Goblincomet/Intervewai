# FOR LOCAL DEVELOPMENT, AUTH USING KEYS (FOR PROD, CREATE SP)
#       docker stop v1 && docker rm v1 && docker image prune -a
#       docker build -t v1 . && docker run --name v1 -p 8080:8080 -v ~/.config/gcloud/application_default_credentials.json:/secrets/key.json -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/key.json v1
# FOR PROD Cloud Run (since building on Mac)
#       Use readme commands
# EXTRA COMMANDS
#   docker exec -it v1 /bin/sh
#   RUN source interviewai/bin/activate

FROM python:3.11

RUN pip3 install fastapi requests openai python-multipart python-dotenv uvicorn google-cloud-secret-manager google-cloud-run
RUN pip3 install --upgrade pip

COPY . /app
WORKDIR /app

ENV PORT 8080

CMD exec uvicorn main:app --reload --host 0.0.0.0 --port 8080
