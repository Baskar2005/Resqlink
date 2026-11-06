import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/feed_provider.dart';
import '../widgets/post_card.dart';

class FeedScreen extends ConsumerWidget {
  const FeedScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedState = ref.watch(feedProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => ref.read(feedProvider.notifier).fetchFeed(feedState.filterType),
        child: CustomScrollView(
          slivers: [
            // Filter Chips Bar
            SliverToBoxAdapter(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    _buildChip(ref, 'All Streams', null, feedState.filterType == null),
                    const SizedBox(width: 8),
                    _buildChip(ref, '🚨 SITREPs', 'SITREP', feedState.filterType == 'SITREP'),
                    const SizedBox(width: 8),
                    _buildChip(ref, '🎯 Training', 'TRAINING', feedState.filterType == 'TRAINING'),
                    const SizedBox(width: 8),
                    _buildChip(ref, '📟 Pager Comms', 'EQUIPMENT', feedState.filterType == 'EQUIPMENT'),
                  ],
                ),
              ),
            ),

            if (feedState.isLoading && feedState.posts.isEmpty)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator(color: AppColors.teal400)),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final post = feedState.posts[index];
                    return PostCard(
                      post: post,
                      onReact: (type) => ref.read(feedProvider.notifier).reactToPost(post.id, type),
                    );
                  },
                  childCount: feedState.posts.length,
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.teal500,
        foregroundColor: Colors.white,
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Opening SITREP broadcast composer...')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildChip(WidgetRef ref, String label, String? type, bool isSelected) {
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        ref.read(feedProvider.notifier).fetchFeed(selected ? type : null);
      },
      selectedColor: AppColors.tealSoft,
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? AppColors.teal400 : AppColors.slate300,
      ),
    );
  }
}

