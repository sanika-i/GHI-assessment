from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime
# import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'dev-secret-key'

# Mock database
USERS = {
    'test@example.com': {
        'password': 'password123',
        'name': 'Test User',
    }
}

FILES = [
    {'id': 1, 'name': 'research_paper.pdf', 'size': '2.3 MB', 'user': 'test@example.com', 'date': '2024-01-15'},
    {'id': 2, 'name': 'data_analysis.csv', 'size': '1.1 MB', 'user': 'test@example.com', 'date': '2024-01-20'},
    {'id': 3, 'name': 'presentation.pptx', 'size': '5.2 MB', 'user': 'test@example.com', 'date': '2024-02-01'},
]

VALID_EXT = {'txt', 'pdf', 'jpg', 'jpeg', 'gif', 'docx'}

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = USERS.get(email)
        if user and user['password'] == password:
            session['email'] = email
            return redirect(url_for('dashboard'))
        
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

# BUG #1: No authentication check!
# Anyone can access dashboard without logging in
@app.route('/dashboard')
def dashboard():
    if 'email' not in session:
        return redirect(url_for('login'))
    
    email = session.get('email')
    user = USERS.get(email)
    
    # This will crash if email is None
    user_files = [f for f in FILES if f['user'] == email]
    
    return render_template('dashboard.html', 
                         user=user, 
                         files=user_files)

# BUG #2: N+1 query pattern (inefficient)
# In a real app with database, this would be very slow
@app.route('/api/files')
def get_files():
    if 'email' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    email = session['email']
    user = USERS.get(email)
    # result = []
    
    # BUG: This loops through all files and checks user for each one
    # In a real database, this would be separate queries for each file
    # for file in FILES:
    #     # Simulating looking up user for each file (N+1 problem)
    #     file_user = USERS.get(file['user'])
    #     if file['user'] == email:
    #         result.append({
    #             'id': file['id'],
    #             'name': file['name'],
    #             'size': file['size'],
    #             'date': file['date'],
    #             'user_name': file_user['name'] if file_user else 'Unknown'
    #         })
    file_user = [
        {
            'id': file['id'],
            'name': file['name'],
            'size': file['size'],
            'date': file['date'],
            'user_name': user['name']
        }
        for file in FILES if file['user'] == email
    ]
    return jsonify(file_user)


# BUG #3: No file type validation
# Only checks extension, not actual file content
def valid_filename(filename):
    exts = filename.rsplit('.', 1)
    if len(exts) != 2:
        return False
    ext = exts[1].lower()
    if '.' in exts[0]:
        return False
    return ext in VALID_EXT

@app.route('/upload', methods=['POST'])
def upload():
    if 'email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    filename = request.form.get('filename', '')

    # BUG: Only checks if filename has extension, doesn't validate type
    # Attacker could upload "malware.exe.pdf"
    # if '.' in filename:
    #     new_file = {
    #         'id': len(FILES) + 1,
    #         'name': filename,
    #         'size': '0.5 MB',
    #         'user': session['email'],
    #         'date': datetime.now().strftime('%Y-%m-%d')
    #     }
    #     FILES.append(new_file)
    #     return redirect(url_for('dashboard'))
    
    # return 'Invalid filename', 400

    if not valid_filename(filename):
        return 'Invalid file type', 400

    allowed_filename = secure_filename(filename)

    new_file = {
        'id': len(FILES) + 1,
        'name': allowed_filename,
        'size': '0.5 MB',
        'user': session['email'],
        'date': datetime.now().strftime('%Y-%m-%d')
    }
    FILES.append(new_file)
    return redirect(url_for('dashboard'))

@app.route('/search')
def search():
    if 'email' not in session:
        return redirect(url_for('login'))
    
    query = request.args.get('q', '').lower()
    email = session['email']
    
    user_files = [f for f in FILES if f['user'] == email]
    
    if query:
        filtered = [f for f in user_files if query in f['name'].lower()]
        return render_template('dashboard.html', 
                             user=USERS.get(email),
                             files=filtered,
                             search_query=query)
    
    return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
