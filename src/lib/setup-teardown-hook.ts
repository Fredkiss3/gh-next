import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

//clean dom after each test https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(cleanup);
