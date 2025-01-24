#!/usr/bin/sh
ctr=$(buildah from registry.access.redhat.com/ubi8/ubi-minimal)
mountpoint=$(buildah mount $ctr)
mkdir -p $mountpoint/var/www
buildah config --workingdir /var/www $ctr
buildah copy $ctr ./assets /var/www
buildah copy $ctr ./*.ts /var/www
buildah config --env DENO_INSTALL=/usr/local $ctr
buildah config --env PATH=$PATH:/usr/local/bin $ctr
buildah run --isolation rootless $ctr /bin/sh -c "microdnf update; \
microdnf -y install unzip; \
curl -fsSL https://deno.land/x/install/install.sh | sh; \
microdnf clean all; \
deno compile --output deno_app --unstable --allow-net --allow-env --allow-read app.ts"
buildah config --entrypoint "./deno_app" $ctr
buildah config --port 8000 $ctr
buildah unmount $ctr
buildah commit --squash $ctr deno-app
buildah push $ctrimg docker://quay.io/ldary/2021-dashboard-ui
buildah rm $ctr