# Secret rotation
A credential version is replaced only if compare-and-swap matches the current version.
Readers fetch the latest enabled version before dispatch; old cached values are not retained.
