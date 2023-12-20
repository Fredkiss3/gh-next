while read -r line; do
    build_args="$build_args --build-arg $line"
done < .env.docker.local
echo "docker build $build_args -t gh-next:latest -f Dockerfile.dev ."
docker build $build_args -t gh-next:latest -f Dockerfile.dev . 