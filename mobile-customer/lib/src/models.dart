class AuthTokens {
  final String access;
  final String refresh;

  AuthTokens({required this.access, required this.refresh});

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      access: json['access'] as String,
      refresh: json['refresh'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'access': access,
        'refresh': refresh,
      };
}

class Order {
  final int id;
  final String status;
  final String dropoffAddress;
  final String total;

  Order({
    required this.id,
    required this.status,
    required this.dropoffAddress,
    required this.total,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as int,
      status: json['status'] as String,
      dropoffAddress: json['dropoff_address_line1'] as String? ?? '',
      total: json['total']?.toString() ?? '0',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status,
        'dropoff_address_line1': dropoffAddress,
        'total': total,
      };
}

class TrackingEvent {
  final int id;
  final String status;
  final String createdAt;

  TrackingEvent({
    required this.id,
    required this.status,
    required this.createdAt,
  });

  factory TrackingEvent.fromJson(Map<String, dynamic> json) {
    return TrackingEvent(
      id: json['id'] as int,
      status: json['status'] as String,
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status,
        'created_at': createdAt,
      };
}
