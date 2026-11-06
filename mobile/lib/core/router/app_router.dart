import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared_widgets/responsive_scaffold.dart';
import '../../features/home_feed/screens/feed_screen.dart';
import '../../features/network/screens/responder_directory_screen.dart';
import '../../features/incident_rooms/screens/incident_rooms_screen.dart';
import '../../features/pager_devices/screens/pager_hub_screen.dart';
import '../../features/messages/screens/messages_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/profile/screens/profile_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        int index = 0;
        final loc = state.uri.path;
        if (loc == '/') index = 0;
        else if (loc.startsWith('/network')) index = 1;
        else if (loc.startsWith('/incidents')) index = 2;
        else if (loc.startsWith('/pagers')) index = 3;
        else if (loc.startsWith('/messages')) index = 4;
        else if (loc.startsWith('/notifications')) index = 5;
        else if (loc.startsWith('/profile')) index = 6;

        return ResponsiveScaffold(
          selectedIndex: index,
          child: child,
        );
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const FeedScreen(),
        ),
        GoRoute(
          path: '/network',
          builder: (context, state) => const ResponderDirectoryScreen(),
        ),
        GoRoute(
          path: '/incidents',
          builder: (context, state) => const IncidentRoomsScreen(),
        ),
        GoRoute(
          path: '/pagers',
          builder: (context, state) => const PagerHubScreen(),
        ),
        GoRoute(
          path: '/messages',
          builder: (context, state) => const MessagesScreen(),
        ),
        GoRoute(
          path: '/notifications',
          builder: (context, state) => const NotificationsScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
  ],
);

