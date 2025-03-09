.env file for the following has to be configured

```python
VITE_BACKEND_URL=

OPENAI_API_KEY=

SIGHTENGINE_API_USER=

SIGHTENGINE_API_SECRET=
```

<br>

If npm does not work, try reinstalling with the following commands in the base directory of the project:

```
Remove-Item -Recurse -Force node_modules

Remove-Item -Force package-lock.json

npm cache clean --force

npm install

npm run dev
```
