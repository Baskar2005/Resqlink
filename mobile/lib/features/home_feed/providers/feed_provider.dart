import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_constants.dart';
import '../models/post_model.dart';

class FeedState {
  final List<PostModel> posts;
  final bool isLoading;
  final String? filterType;

  FeedState({this.posts = const [], this.isLoading = false, this.filterType});

  FeedState copyWith({List<PostModel>? posts, bool? isLoading, String? filterType}) {
    return FeedState(
      posts: posts ?? this.posts,
      isLoading: isLoading ?? this.isLoading,
      filterType: filterType ?? this.filterType,
    );
  }
}

class FeedNotifier extends StateNotifier<FeedState> {
  final DioClient _dioClient = DioClient();

  FeedNotifier() : super(FeedState()) {
    fetchFeed();
  }

  Future<void> fetchFeed([String? type]) async {
    state = state.copyWith(isLoading: true, filterType: type);
    try {
      final response = await _dioClient.dio.get(
        ApiConstants.posts,
        queryParameters: type != null ? {'type': type} : null,
      );

      if (response.statusCode == 200) {
        final List list = response.data['posts'] ?? [];
        final posts = list.map((p) => PostModel.fromJson(p)).toList();
        state = state.copyWith(posts: posts, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> reactToPost(String postId, String reactionType) async {
    try {
      final response = await _dioClient.dio.post(
        '${ApiConstants.posts}/$postId/react',
        data: {'reactionType': reactionType},
      );
      if (response.statusCode == 200) {
        await fetchFeed(state.filterType);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final feedProvider = StateNotifierProvider<FeedNotifier, FeedState>((ref) {
  return FeedNotifier();
});

