class Manual {
  const Manual({required this.name, required this.link});

  factory Manual.fromJson(Map<String, String> json) {
    return Manual(name: json.keys.first, link: json.values.first);
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{};
  }

  final String? name;
  final String? link;
}

class ManualList {
  const ManualList({
    required this.manuals,
  });

  factory ManualList.fromJson(Map<String, dynamic> json) {
    final List<Manual> manuals = [];
    json.forEach((key, dynamic value) {
      manuals.add(Manual(name: key, link: value));
    });
    return ManualList(manuals: manuals);
  }

  final List<Manual> manuals;

  Map<String, dynamic> toJson() {
    return manuals.where((manual) => manual.name != null).toList().asMap().map<String, dynamic>(
        (int index, Manual manual) => MapEntry<String, dynamic>(manual.name ?? '', manual.link ?? ''));
  }
}
