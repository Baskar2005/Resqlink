import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_constants.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;

  late final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _authToken;

  DioClient._internal() {
    final String activeBase = kIsWeb ? ApiConstants.webBaseUrl : ApiConstants.baseUrl;

    dio = Dio(
      BaseOptions(
        baseUrl: activeBase,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          _authToken ??= await _storage.read(key: 'resqlink_token');
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired or revoked
            await clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> setToken(String token) async {
    _authToken = token;
    await _storage.write(key: 'resqlink_token', value: token);
  }

  Future<void> clearToken() async {
    _authToken = null;
    await _storage.delete(key: 'resqlink_token');
  }

  String? get currentToken => _authToken;
}

