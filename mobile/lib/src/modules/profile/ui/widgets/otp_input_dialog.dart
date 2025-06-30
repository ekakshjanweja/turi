import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class OtpInputDialog extends StatefulWidget {
  final String title;
  final String description;
  final Function(String) onVerify;
  final VoidCallback onCancel;
  final bool isLoading;

  const OtpInputDialog({
    super.key,
    required this.title,
    required this.description,
    required this.onVerify,
    required this.onCancel,
    this.isLoading = false,
  });

  @override
  State<OtpInputDialog> createState() => _OtpInputDialogState();
}

class _OtpInputDialogState extends State<OtpInputDialog> {
  final List<TextEditingController> _controllers = 
      List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = 
      List.generate(6, (index) => FocusNode());

  String get otp => _controllers.map((c) => c.text).join();

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  void _onChanged(String value, int index) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    
    // Auto-submit when all 6 digits are entered
    if (otp.length == 6) {
      widget.onVerify(otp);
    }
  }

  void _onBackspace(int index) {
    if (index > 0 && _controllers[index].text.isEmpty) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Text(
        widget.title,
        style: context.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.bold,
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            widget.description,
            style: context.textTheme.bodyMedium?.copyWith(
              color: context.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(6, (index) {
              return SizedBox(
                width: 45,
                height: 55,
                child: TextField(
                  controller: _controllers[index],
                  focusNode: _focusNodes[index],
                  textAlign: TextAlign.center,
                  style: context.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  enabled: !widget.isLoading,
                  decoration: InputDecoration(
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: context.colorScheme.outline,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: context.colorScheme.primary,
                        width: 2,
                      ),
                    ),
                    filled: true,
                    fillColor: widget.isLoading 
                        ? context.colorScheme.surfaceVariant.withOpacity(0.5)
                        : context.colorScheme.surface,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  onChanged: (value) => _onChanged(value, index),
                  onTap: () => _controllers[index].selectAll(),
                  onSubmitted: (value) {
                    if (index < 5 && value.isNotEmpty) {
                      _focusNodes[index + 1].requestFocus();
                    } else if (otp.length == 6) {
                      widget.onVerify(otp);
                    }
                  },
                  onEditingComplete: () {
                    if (index < 5) {
                      _focusNodes[index + 1].requestFocus();
                    }
                  },
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          if (widget.isLoading)
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 12),
                Text("Verifying..."),
              ],
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: widget.isLoading ? null : widget.onCancel,
          child: const Text("Cancel"),
        ),
        FilledButton(
          onPressed: widget.isLoading || otp.length != 6 
              ? null 
              : () => widget.onVerify(otp),
          child: const Text("Verify"),
        ),
      ],
    );
  }
}

extension on TextEditingController {
  void selectAll() {
    if (text.isNotEmpty) {
      selection = TextSelection(baseOffset: 0, extentOffset: text.length);
    }
  }
} 