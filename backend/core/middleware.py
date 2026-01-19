import uuid

from .logging import request_id


class RequestIdMiddleware:
    header_name = "X-Request-ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        incoming_id = request.headers.get(self.header_name)
        current_id = incoming_id or str(uuid.uuid4())
        request.request_id = current_id
        token = request_id.set(current_id)
        response = self.get_response(request)
        response[self.header_name] = current_id
        request_id.reset(token)
        return response
