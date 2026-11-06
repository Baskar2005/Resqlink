class ApiConstants {
  // Configured for local development or field tactical server
  // On Android emulator use 10.0.2.2; on iOS or desktop use localhost or LAN IP
  static const String baseUrl = 'http://10.0.2.2:4000/api';
  static const String webBaseUrl = 'http://localhost:4000/api';

  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String availability = '/auth/availability';
  static const String responders = '/auth/responders';

  static const String posts = '/posts';
  static const String incidents = '/incidents';
  static const String joinIncident = '/incidents/join';
  static const String tasks = '/tasks';
  
  static const String pagerDevices = '/pager/devices';
  static const String pagerAlerts = '/pager/alerts';
  static const String pagerDispatch = '/pager/alerts/dispatch';
  static const String pagerAcknowledge = '/pager/alerts/acknowledge';
  
  static const String messages = '/messages';
  static const String notifications = '/notifications';
}

