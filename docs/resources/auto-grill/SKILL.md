---
name: auto-grill
description: Use when a user asks for agent-to-agent grilling or a human Grilling or Grill with Docs session is collecting recommended answers.
---

# Auto Grill

Keep interviewing the human until they choose to hand the remaining design decisions to agents. The handoff authorizes the interview and its decision record within the agreed scope.

## Offer the switch

Use Grilling or Grill with Docs for human rounds when available. Use the native pop-out questionnaire for each decision and for the switch offer. Put the recommendation first, label it **(Recommended)** and give realistic choices. If the pop-out is unavailable, tell the user and leave the question pending. Present it when the pop-out becomes available.

Count consecutive, explicitly accepted recommendations within the same grilling session. Count each answered decision once, in question order, including across a continuation with the same scope. A different substantive answer resets the streak. A preselection, skip, timeout, ambiguous reply or unconfirmed default adds nothing. Use the answers you can verify and retain the count and any pending or declined offer when handing off.

When a round ends with at least 20 consecutive accepted recommendations, or the threshold the user chose, offer the switch before the next design round. Deliver one offer per session. For example, ask whether they want a separate informed interviewer to grill the acting agent through the remaining chapters and return the decisions for review. Offer **Switch to agent grilling (Recommended)** and **Keep grilling me**. Wait for their answer. An explicit yes starts agent grilling. A decline keeps human rounds going without another offer in that session. Silence or ambiguity leaves the offer pending. A direct request to have agents finish the interview gives consent at any count, including after a decline.

## Run the agent interview

1. Read the project or design record, active scope, settled decisions and open questions. Give them to a separate collaboration subagent with the relevant sources and Grilling or Grill with Docs instructions. The interviewer reads the evidence and asks numbered questions with a recommendation and distinct choices over collaboration. The acting agent answers and records decisions. If a separate interviewer is unavailable, tell the user and leave that handoff pending.
2. Continue in rounds through the agreed scope. Ask questions whose prerequisites are settled, answer with a choice and reason, and use the answer to find the next open decisions. Preserve earlier approvals and attribute new choices to the acting agent. Keep decisions that require the owner's authority open and continue independent branches. If a human decision is essential before another branch can proceed, ask for it in the pop-out.
3. Close when the interviewer confirms the remaining design questions are covered or names the decisions still awaiting the owner. Verify the project record includes the questions, answers, reasons, expected checks and next action. For Project Bible, keep the Work mode in Grilling and link the verified reader and relevant chapters for owner review. The record distinguishes proposed checks from evidence of checks already run. Implementation and mode changes follow the user's existing authorization.
