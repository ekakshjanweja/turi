import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/local_storage/kv_store.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';

class DeleteAccountDialog extends StatefulWidget {
  const DeleteAccountDialog({super.key});

  @override
  State<DeleteAccountDialog> createState() => _DeleteAccountDialogState();
}

class _DeleteAccountDialogState extends State<DeleteAccountDialog> {
  bool _isLoading = false;

  Future<void> _handleDelete() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final ap = context.read<AuthProvider>();

      final error = await ap.deleteUser();

      if (error != null) {
        setState(() {
          _isLoading = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(error.message)));
        }
        return;
      }

      await KVStore.clear();

      final cp = context.read<ChatProvider>();
      cp.reset();

      context.go(AuthPage.routeName);
    } catch (e) {
      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('An unexpected error occurred: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        "Delete Account",
        style: context.textTheme.titleSmall.copyWith(
          color: context.colorScheme.onSurface,
        ),
      ),
      content: Text(
        "Are you sure you want to delete your account? A confirmation email will be sent to complete the deletion. This action cannot be undone.",
        style: context.textTheme.bodySmall.copyWith(
          color: context.colorScheme.onSurface,
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text("Cancel"),
        ),
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: context.colorScheme.error,
            foregroundColor: context.colorScheme.onError,
          ),
          onPressed: _isLoading ? null : _handleDelete,
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Text("Delete"),
        ),
      ],
    );
  }
}
