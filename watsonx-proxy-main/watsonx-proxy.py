import os
import shutil
import zipfile
from secret_key_generator import secret_key_generator
from flask import Flask, request, jsonify, make_response
from db import db
from watsonx import Watsonx
from flask_cors import CORS

app = Flask(__name__)

CORS(app)



app.config['SECRET_KEY'] = secret_key_generator.generate(len_of_secret_key=32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)

with app.app_context():
    db.create_all()


def extract_zip(zip_path, extract_path):
    """Extract a zip file to the specified path."""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        return True
    except Exception as e:
        print(f"Error extracting zip file: {str(e)}")
        return False


@app.route('/reset-uploads', methods=['DELETE'])
def reset_uploads():
    try:
        # Delete all contents in the uploads folder
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')

        return jsonify({'message': 'Upload folder cleared successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to clear upload folder: {str(e)}'}), 500

@app.route('/fetch-index-file', methods=['GET'])
def fetch_index_file():
    index_file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main', 'templates', 'index.html')

    try:
        if not os.path.isfile(index_file_path):
            return jsonify({'error': 'File not found'}), 404

        with open(index_file_path, 'r') as file:
            file_contents = file.read()

        # Return the contents as JSON
        return jsonify({'file_contents': file_contents}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500


@app.route('/update_jenkins_config', methods=['POST'])
def update_jenkins_config():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Ensure the content field is present in the request
        if 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400

        # Define base path and create devops directory
        base_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main')
        devops_dir = os.path.join(base_path, 'devops')

        # Create the devops directory if it doesn't exist
        os.makedirs(devops_dir, exist_ok=True)

        # Define the path for jenkinsconfig.txt
        jenkins_config_path = os.path.join(devops_dir, 'jenkinsconfig.txt')

        # Write the content to jenkinsconfig.txt
        with open(jenkins_config_path, 'w') as file:
            file.write(data['content'])

        return jsonify({
            'message': 'Jenkins configuration saved successfully',
            'path': jenkins_config_path
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Failed to save Jenkins configuration: {str(e)}'
        }), 500


@app.route('/update_jenkinsfile', methods=['POST'])
def update_jenkinsfile():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Ensure the content field is present in the request
        if 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400

        # Define base path and create devops directory
        base_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main')
        devops_dir = os.path.join(base_path, 'devops')

        # Create the devops directory if it doesn't exist
        os.makedirs(devops_dir, exist_ok=True)

        # Define the path for Jenkinsfile
        jenkinsfile_path = os.path.join(devops_dir, 'Jenkinsfile')

        # Write the content to Jenkinsfile
        with open(jenkinsfile_path, 'w') as file:
            file.write(data['content'])

        return jsonify({
            'message': 'Jenkinsfile saved successfully',
            'path': jenkinsfile_path
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Failed to save Jenkinsfile: {str(e)}'
        }), 500


@app.route('/update_dockerfile', methods=['POST'])
def update_dockerfile():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Ensure the content field is present in the request
        if 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400

        # Define base path and create devops directory
        base_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main')
        devops_dir = os.path.join(base_path, 'devops')

        # Create the devops directory if it doesn't exist
        os.makedirs(devops_dir, exist_ok=True)

        # Define the path for Dockerfile
        dockerfile_path = os.path.join(devops_dir, 'Dockerfile')

        # Write the content to Dockerfile
        with open(dockerfile_path, 'w') as file:
            file.write(data['content'])

        return jsonify({
            'message': 'Dockerfile saved successfully',
            'path': dockerfile_path
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Failed to save Dockerfile: {str(e)}'
        }), 500


@app.route('/update_ocp_config', methods=['POST'])
def update_ocp_config():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Ensure the content field is present in the request
        if 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400

        # Define base path and create devops directory
        base_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main')
        devops_dir = os.path.join(base_path, 'devops')

        # Create the devops directory if it doesn't exist
        os.makedirs(devops_dir, exist_ok=True)

        # Define the path for OCP config file
        ocp_config_path = os.path.join(devops_dir, 'movies.yaml')

        # Write the content to ocp-config.yaml
        with open(ocp_config_path, 'w') as file:
            file.write(data['content'])

        return jsonify({
            'message': 'OpenShift configuration saved successfully',
            'path': ocp_config_path
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Failed to save OpenShift configuration: {str(e)}'
        }), 500

@app.route('/update_main_file', methods=['POST'])
def update_main_file():
    # Get the JSON data from the request
    data = request.get_json()

    # Ensure the content field is present in the request
    if 'content' not in data:
        return jsonify({'error': 'No content provided'}), 400

    # Define the path to the main.py file
    main_file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main', 'main.py')

    try:
        # Write the new content to the main.py file
        with open(main_file_path, 'w') as file:
            file.write(data['content'])

        return jsonify({'message': 'Main file updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to update main file: {str(e)}'}), 500

@app.route('/update_index_file', methods=['POST'])
def update_index_file():
    # Get the JSON data from the request
    data = request.get_json()

    # Ensure the content field is present in the request
    if 'content' not in data:
        return jsonify({'error': 'No content provided'}), 400

    # Define the path to the index.html file
    index_file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main', 'templates', 'index.html')

    try:
        # Write the new content to the index.html file
        with open(index_file_path, 'w') as file:
            file.write(data['content'])

        return jsonify({'message': 'Index file updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to update index file: {str(e)}'}), 500



@app.route('/fetch-main-file', methods=['GET'])
def fetch_main_file():
    # Define the relative path to the main.py file
    main_file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'fav-movies', 'fav-movies-main', 'main.py')

    try:
        # Check if the file exists
        if not os.path.isfile(main_file_path):
            return jsonify({'error': 'File not found'}), 404

        # Read the contents of the main.py file
        with open(main_file_path, 'r') as file:
            file_contents = file.read()

        # Return the contents as JSON
        return jsonify({'file_contents': file_contents}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500



@app.route("/watsonx_proxy", methods=['POST'])
def watsonx_proxy():
    payload = request.get_json()
    print(payload)
    watsonx = Watsonx()
    return watsonx.ask_watsonx(payload_in=payload)


@app.route('/upload', methods=['POST'])
def upload_file():
    print("file upload called")
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # If it's a zip file, extract it
    if file.filename.lower().endswith('.zip'):
        extract_folder = os.path.join(
            app.config['UPLOAD_FOLDER'],
            os.path.splitext(file.filename)[0]
        )
        os.makedirs(extract_folder, exist_ok=True)

        if extract_zip(file_path, extract_folder):
            return jsonify({
                'message': 'File uploaded and extracted successfully',
                'filename': file.filename,
                'extracted_path': extract_folder
            }), 200
        else:
            return jsonify({
                'message': 'File uploaded but extraction failed',
                'filename': file.filename
            }), 200

    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename
    }), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)