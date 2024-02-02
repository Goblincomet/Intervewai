# RUN THIS SCRIPT WITH: ./deploy-script.sh v1
#!/bin/zsh

cd ~/Documents/Repositories/interviewai-backend

image="image-$1"
location="us-central1"
repository_name="interviewai"
service_name="interviewai-voice-backend"

docker image prune -af

gcloud config set run/region $location
gcloud config set project interviewai-voice-backend
gcloud services enable artifactregistry.googleapis.com
gcloud auth configure-docker $location-docker.pkg.dev

docker buildx build --platform linux/amd64 -t $location-docker.pkg.dev/$service_name/$repository_name/$image .

docker push $location-docker.pkg.dev/$service_name/$repository_name/$image

gcloud run deploy $service_name \
    --image=$location-docker.pkg.dev/$service_name/$repository_name/$image \
    --platform=managed \
    --region=$location
