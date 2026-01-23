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
  final String pickupAddress;
  final String dropoffAddress;
  final String total;

  Order({
    required this.id,
    required this.status,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.total,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as int,
      status: json['status'] as String,
      pickupAddress: json['pickup_address_line1'] as String? ?? '',
      dropoffAddress: json['dropoff_address_line1'] as String? ?? '',
      total: json['total']?.toString() ?? '0',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status,
        'pickup_address_line1': pickupAddress,
        'dropoff_address_line1': dropoffAddress,
        'total': total,
      };
}
