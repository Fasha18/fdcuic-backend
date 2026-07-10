import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/app_colors.dart';

class ModalSelector<T> extends StatefulWidget {
  final String title;
  final List<T> items;
  final String Function(T) labelBuilder;
  final void Function(T) onSelected;
  final T? initialSelection;

  const ModalSelector({
    super.key,
    required this.title,
    required this.items,
    required this.labelBuilder,
    required this.onSelected,
    this.initialSelection,
  });

  static Future<void> show<T>({
    required BuildContext context,
    required String title,
    required List<T> items,
    required String Function(T) labelBuilder,
    required void Function(T) onSelected,
    T? initialSelection,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ModalSelector<T>(
        title: title,
        items: items,
        labelBuilder: labelBuilder,
        onSelected: onSelected,
        initialSelection: initialSelection,
      ),
    );
  }

  @override
  State<ModalSelector<T>> createState() => _ModalSelectorState<T>();
}

class _ModalSelectorState<T> extends State<ModalSelector<T>> {
  late List<T> _filteredItems;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
    _searchCtrl.addListener(_onSearch);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearch() {
    final q = _searchCtrl.text.toLowerCase();
    setState(() {
      _filteredItems = widget.items
          .where((e) => widget.labelBuilder(e).toLowerCase().contains(q))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return Container(
          decoration: BoxDecoration(
            color: c.bgPrimary,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              Center(
                child: Container(
                  margin: EdgeInsets.symmetric(vertical: 12),
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.title,
                      style: GoogleFonts.sora(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w700,
                          color: c.txtPrimary),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: c.txtSecondary),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: EdgeInsets.fromLTRB(24, 8, 24, 16),
                child: TextField(
                  controller: _searchCtrl,
                  style: GoogleFonts.sora(color: c.txtPrimary, fontSize: 14.sp),
                  decoration: InputDecoration(
                    hintText: 'Rechercher...',
                    hintStyle:
                        GoogleFonts.sora(color: c.txtSecondary, fontSize: 14.sp),
                    prefixIcon: Icon(Icons.search, color: c.txtSecondary),
                    filled: true,
                    fillColor: c.bgCard,
                    contentPadding: EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              Divider(height: 1, color: c.borderMain),
              Expanded(
                child: ListView.builder(
                  controller: controller,
                  itemCount: _filteredItems.length,
                  itemBuilder: (context, index) {
                    final item = _filteredItems[index];
                    final isSelected = item == widget.initialSelection;
                    return InkWell(
                      onTap: () {
                        widget.onSelected(item);
                        Navigator.pop(context);
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        decoration: BoxDecoration(
                          border: Border(
                              bottom:
                                  BorderSide(color: c.borderMain, width: 0.5)),
                          color: isSelected ? c.navActiveBg : Colors.transparent,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                widget.labelBuilder(item),
                                style: GoogleFonts.sora(
                                  fontSize: 14.sp,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                  color: isSelected
                                      ? c.accentPurple
                                      : c.txtPrimary,
                                ),
                              ),
                            ),
                            if (isSelected)
                              Icon(Icons.check, color: c.accentPurple, size: 20),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
