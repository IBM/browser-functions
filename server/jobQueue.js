/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = class JobQueue {
    constructor() {
        this.jobs = {}
    }

    push(jobData) {
        this.jobs[jobData.jobId] = jobData
    }

    getJob(jobId) {
        return this.jobs[jobId]
    }

    completeJob({ jobId, data }) {
        console.log("COMPLETED JOB", jobId, data, this.jobs[jobId]);
        if (this.jobs[jobId]) {
            this.jobs[jobId].onSuccess(data)
            this.jobs[jobId].onComplete()
            delete this.jobs[jobId]
        }
    }

    streamJob({ jobId, data }) {
        if (this.jobs[jobId]) {
            const onJobSuccess = this.jobs[jobId].onSuccess
            onJobSuccess(data)
        }
    }

    failJob({ jobId, data }) {
        if (this.jobs[jobId]) {
            const onJobFail = this.jobs[jobId].onFailure
            onJobFail(data)
            delete this.jobs[jobId]
        }
    }
}
