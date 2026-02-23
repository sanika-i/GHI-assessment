# Bug Report

## Bug #1: Dashboard Was Accessible Without Logging In

**Where:** `app.py` — `/dashboard` route

**What was happening:**
The dashboard had no check to verify whether a user was actually logged in. Anyone who knew the URL could navigate directly to `/dashboard` and get in. Additionally, if `session['email']` wasn't set the app could behave unpredictably or crash when trying to render data.

**Why it matters:**
This is a security gap, protected pages should only be visible to authenticated users. It also introduced a stability risk since the app assumed session data would always be present.

**The fix:**
Added a session check at the top of the route that redirects unauthenticated users back to login:

```python
if 'email' not in session:
    return redirect(url_for('login'))
```

**To verify:**
Start the app and go directly to `/dashboard` without logging in — you should be redirected to the login page. `/dashboard` only renders if user is logged in.

---

## Bug #2: Inefficient File Lookup (N+1 Pattern)

**Where:** `app.py` — `/api/files` route

**What was happening:**
The endpoint was looping through every file and doing a separate user lookup on each iteration. In this app with mock data it is not noticeable, but in any real database application this is a N+1 query problem, one query to get the files, then another query/file to get the user. Performance degrades as data grows.

**Why it matters:**
This pattern doesn't scale. Response times would climb significantly with a larger dataset.

**The fix:**
Replaced the loop with a single list comprehension that fetches the current user once and filters files by their email in one pass:

```python
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
```

**To verify:**
1. Log in as `test@example.com` and hit `/api/files`.
2. Confirm only that user's files are returned and the response includes `user_name`.

---

## Bug #3: File Upload Had Basically No Validation

**Where:** `app.py` — `/upload` route

**What was happening:**
The upload logic checked for a valid file by only seeing if the filename contained a dot. So a file like `testFile.` would pass. This opened the door to disguised malicious files as well and potentially unsafe filenames being stored by the app.

**Why it matters:**
Accepting files based purely on whether the name has a dot in it is essentially no validation at all. It could allow execution of malicious files or directory traversal attacks depending on how files are handled downstream.

**The fix:**
Replaced the dot check with a proper `valid_filename()` function that:
- Requires exactly one extension (blocks `test.exe.pdf` style double extensions)
- Checks the extension against an explicit valid extensions list
- Uses `secure_filename()` to sanitize the name before storing it

```python
VALID_EXT = {'txt', 'pdf', 'jpg', 'jpeg', 'gif', 'docx'}
```

**To verify:**
1. Log in and try uploading `document.pdf` — should succeed.
2. Try `test.` — should be rejected.
3. Try `test.exe.pdf` — should be rejected.
4. Confirm successful uploads appear in the dashboard.