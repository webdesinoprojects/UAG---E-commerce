export function getOriginalImageKitVideoUrl(url: string) {
  return url.replace(
    /^(https:\/\/ik\.imagekit\.io\/[^/]+\/)(?!tr:orig-true\/)/,
    "$1tr:orig-true/"
  );
}
