# README #

# python3 -m venv interviewai - to create new environment
# source interviewai/bin/activate
# uvicorn main:app --reload --host 0.0.0.0 --port 8080
# RUN THROUGH DOCKERFILE COMMANDS INSTEAD

# AUTH
gcloud auth login
gcloud init

## SEE DEPLOY SCRIPT ##
./deploy-script.sh v1

# Or To Create
# gcloud artifacts repositories create interviewai \
#  --repository-format=docker \
#  --location=$location \
#  --description="InterviewAI Voice App"

# GCLOUD Location
cd ~/Documents
./google-cloud-sdk/bin/gcloud init
