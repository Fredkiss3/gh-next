while read -r line; do
    build_args="$build_args --build-arg $line"
done < .env.docker.local
docker build $build_args -t dcr.fredkiss.dev/gh-next:latest -f docker/Dockerfile.dev . 