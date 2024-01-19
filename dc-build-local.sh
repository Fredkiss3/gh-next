while read -r line; do
    build_args="$build_args --build-arg $line"
done < .env.docker.local
echo args="'$build_args'"
docker buildx build --push -t dcr.fredkiss.dev/gh-next:dev -f docker/Dockerfile.dev $build_args .