# DataViva API

[DataViva](https://github.com/DataViva/dataviva-site) is a research tool that provides official data about exportation, economic activity, locality, education and occupation in Brazil. DataViva API is built using the following technology stack.

- Python
- Flask
- Redis
- Amazon Redshift


## Installing

This installation guide is written assuming a Linux or Linux-like environment.

1. Clone from github (this will create dataviva folder in the current directory)

```
git clone https://github.com/DataViva/dataviva-api.git
```

2. [optional] Create a virtual environment. We suggest installing [virtualenv](https://pypi.python.org/pypi/virtualenv) with [virtualenvwrapper](http://virtualenvwrapper.readthedocs.io/en/latest/) especially if the machine you are using is used for many other web projects. This allows python libraries to be installed easily and specifically on a per project basis.

Once this is complete, run the following to initialize your dataviva environment.

```
mkvirtualenv dataviva-api
workon dataviva-api
```

3. Install the required Python libraries

```
pip install -r requirements.txt
```

4. Set the following environment variables

*(if using virtualenv)* add the following to to the bottom of your virtualenv activate file (virtualenv_root/bin/activate).

```
export ENV=

export REDIS_HOST=
export REDIS_PORT
export REDIS_DB

export DATAVIVA_REDSHIFT_USER=
export DATAVIVA_REDSHIFT_PW=
export DATAVIVA_REDSHIFT_HOST=
export DATAVIVA_REDSHIFT_NAME=

export S3_PUBLIC_BUCKET_URL=
```

5. Run api

```
python manage.py runserver
```

## Documentation

The API documentation is available in the [wiki](https://github.com/DataViva/dataviva-api/wiki/documentation) page.
