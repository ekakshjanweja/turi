enum MethodType {
  get("GET"),
  post("POST"),
  patch("PATCH"),
  delete("DELETE");

  final String value;
  const MethodType(this.value);
}
