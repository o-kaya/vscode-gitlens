'use strict';
import { GitBranch } from './../git';

const branchWithTrackingRegex = /^(\*?)\s+(.+?)\s+([0-9,a-f]+)\s+(?:\[(.*?\/.*?)(?:\:\s(.*)\]|\]))?/gm;
const branchWithTrackingStateRegex = /^(?:ahead\s([0-9]+))?[,\s]*(?:behind\s([0-9]+))?/;

export class GitBranchParser {
    static parse(data: string, repoPath: string): GitBranch[] | undefined {
        if (!data) return undefined;

        const branches: GitBranch[] = [];

        let match: RegExpExecArray | null = null;
        do {
            match = branchWithTrackingRegex.exec(data);
            if (match == null) break;

            const [ahead, behind] = this.parseState(match[5]);
            branches.push(
                new GitBranch(
                    repoPath,
                    // Stops excessive memory usage -- https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    (' ' + match[2]).substr(1),
                    match[1] === '*',
                    // Stops excessive memory usage -- https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    match[3] === undefined ? undefined : (' ' + match[3]).substr(1),
                    // Stops excessive memory usage -- https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    match[4] === undefined ? undefined : (' ' + match[4]).substr(1),
                    ahead,
                    behind
                )
            );
        } while (match != null);

        if (!branches.length) return undefined;

        return branches;
    }

    static parseState(state: string): [number, number] {
        if (state == null) return [0, 0];

        const match = branchWithTrackingStateRegex.exec(state);
        if (match == null) return [0, 0];

        const ahead = parseInt(match[1], 10);
        const behind = parseInt(match[2], 10);
        return [isNaN(ahead) ? 0 : ahead, isNaN(behind) ? 0 : behind];
    }
}
