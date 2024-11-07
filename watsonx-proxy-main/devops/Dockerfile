FROM python:3.11-slim
LABEL maintainer="EESI Lab - Automation Squad"
RUN groupadd -r favuser && useradd -r -g favuser favuser
ENV PROJECT_ID="" \
    API_KEY="" \
    WATSONX_URL=""

RUN mkdir app
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy the application files
COPY . .

# Set ownership of the application directory to the non-root user
RUN chmod -R 777 .
RUN chown -R favuser:favuser .

# Switch to the non-root user
USER favuser

EXPOSE 8080

CMD ["python", "watsonx-proxy.py"]
