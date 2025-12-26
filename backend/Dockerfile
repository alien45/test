FROM python:3.10-slim
WORKDIR /app
# copy all files
COPY . . 

# Make scripts executable and run setup-venv.sh to setup the venv
RUN chmod +x setup-venv.sh start.sh && ./setup-venv.sh

# Expose the port the app runs on (3000 as per start.sh)
EXPOSE 3000

# Run start.sh to start the api server
CMD ["./start.sh"]
