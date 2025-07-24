FROM python:3.8

ENV PYTHONUNBUFFERED=1

WORKDIR /server

COPY . /server/

RUN python -m pip install --upgrade pip \
    && pip install -r requirements.txt \
    && python manage.py collectstatic --no-input \
    && python manage.py makemigrations \
    && python manage.py migrate \
    && python build.py

EXPOSE 8000

CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000"]

