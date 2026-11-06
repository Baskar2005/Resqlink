import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../models/post_model.dart';

class PostCard extends StatelessWidget {
  final PostModel post;
  final Function(String reactionType)? onReact;

  const PostCard({Key? key, required this.post, this.onReact}) : super(key: key);

  Color _getSeverityColor(String severity) {
    switch (severity) {
      case 'FLASH_EMERGENCY':
        return AppColors.red500;
      case 'PRIORITY':
        return AppColors.orange400;
      default:
        return AppColors.slate400;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Author Meta Header
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(post.authorAvatarUrl),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              post.authorName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (post.isAuthorVerified) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, color: AppColors.teal400, size: 14),
                          ],
                        ],
                      ),
                      Text(
                        '${post.authorRank} • Callsign: ${post.authorCallsign}',
                        style: const TextStyle(fontSize: 11, color: AppColors.slate400),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getSeverityColor(post.severity).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _getSeverityColor(post.severity), width: 1),
                  ),
                  child: Text(
                    post.severity.replaceAll('_', ' '),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _getSeverityColor(post.severity),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Title & Content
            Text(
              post.title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: -0.2),
            ),
            const SizedBox(height: 6),
            Text(
              post.content,
              style: const TextStyle(fontSize: 13, color: AppColors.slate300, height: 1.4),
            ),

            if (post.locationName != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.place_outlined, size: 14, color: AppColors.slate400),
                  const SizedBox(width: 4),
                  Text(post.locationName!, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                ],
              ),
            ],

            if (post.imageUrl != null) ...[
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  post.imageUrl!,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => const SizedBox(),
                ),
              ),
            ],

            const SizedBox(height: 12),
            const Divider(color: AppColors.navy600, height: 1),
            const SizedBox(height: 8),

            // Reaction Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildReactionBtn('10-4 Copy', '👍', post.acknowledgeCount, () => onReact?.call('acknowledge')),
                _buildReactionBtn('Salute', '🎖️', post.saluteCount, () => onReact?.call('salute')),
                _buildReactionBtn('Standby', '🤝', post.supportCount, () => onReact?.call('support')),
                Text('💬 ${post.commentsCount}', style: const TextStyle(fontSize: 12, color: AppColors.slate400)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReactionBtn(String label, String emoji, int count, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 4),
            Text('$count', style: const TextStyle(fontSize: 11, color: AppColors.slate400, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

