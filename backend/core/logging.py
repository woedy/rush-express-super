import contextvars

request_id = contextvars.ContextVar("request_id", default="-")


class RequestIdFilter:
    def filter(self, record):
        record.request_id = request_id.get()
        return True
