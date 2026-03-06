class ApiResponse {
  const ApiResponse(
      {required this.body, required this.status, this.statusCode});

  final bool status;
  final dynamic body;
  final int? statusCode;
}
