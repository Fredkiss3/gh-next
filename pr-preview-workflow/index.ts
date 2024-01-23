import { $, file } from "bun";

let input = "";
// read stdin
for await (const chunk of Bun.stdin.stream()) {
  // chunk is Uint8Array
  // this converts it to text (assumes ASCII encoding)
  input += Buffer.from(chunk).toString();
}
console.log(`Chunk: ${input}`);

// TODO
/**
 * process validate input for
 * - PR-ID, PR-BRANCH
 * - Read list of files inside caddy folder
 * - check if...
 */

// const CADDY_TEMPLATE_CONTENT = `gh-${PR_ID}.gh.fredkiss.dev, gh-${PR_BRANCH}.gh.fredkiss.dev {
//     route {
//        sablier localhost:10000 {
//          group gh-next-${PR_ID}
//          session_duration 30m
//          dynamic {
//             theme ghost
//             display_name gh-next-${PR_ID}
//             refresh_frequency 5s
//          }
//        }

//       reverse_proxy gh-next-${PR_ID}:3000
//     }
//     log
// }`;

// reload caddy service in docker
// await $`docker exec $(docker ps -q -f name=caddy-stack_proxy) ls /etc/caddy`;
