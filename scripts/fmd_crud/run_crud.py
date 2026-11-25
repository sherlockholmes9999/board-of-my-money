#!/usr/bin/env python3
"""End-to-end CRUD and guardrail checks for the Financial Master Data prototype.

Run from the project root with:
    python scripts/fmd_crud/run_crud.py

The browser context is isolated and ephemeral. Test data is never written to a
user's existing preview storage. Results and failure screenshots go to /tmp.
"""

import asyncio
import json
import os
import re
import tempfile
import traceback
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from playwright.async_api import async_playwright


BASE_URL = os.environ.get("FMD_BASE_URL", "http://localhost:8080").rstrip("/")
FMD = "/financial-master-data"
RUN_ID = f"TST-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid4().hex[:6].upper()}"
OUTPUT = Path(tempfile.gettempdir()) / "browser" / "fmd_crud"
SCREENSHOTS = OUTPUT / "screenshots"
OUTPUT.mkdir(parents=True, exist_ok=True)
SCREENSHOTS.mkdir(parents=True, exist_ok=True)


# The dashboard plus the 19 canonical data interfaces comprise the 20-page
# acceptance set. Intermediate area pages are checked separately for reading
# and navigation below.
PAGES = [
    {"name": "Financial Master Data", "path": FMD, "kind": "dashboard"},
    {"name": "Account Structure", "path": f"{FMD}/chart-of-accounts/account-structure", "singular": "Account", "statusful": True},
    {"name": "Account Hierarchy", "path": f"{FMD}/chart-of-accounts/account-hierarchy", "singular": "Account", "statusful": True, "tree": True},
    {"name": "Account Types", "path": f"{FMD}/chart-of-accounts/account-types", "singular": "Account Type", "statusful": True},
    {"name": "Account Control Rules", "path": f"{FMD}/chart-of-accounts/account-control-rules", "singular": "Control Rule", "statusful": True},
    {"name": "Cost Center Hierarchy", "path": f"{FMD}/cost-centers/cost-center-hierarchy", "singular": "Cost Center", "statusful": True, "tree": True},
    {"name": "Cost Center Ownership", "path": f"{FMD}/cost-centers/cost-center-ownership", "singular": "Cost Center", "statusful": True},
    {"name": "Cost Center Validity", "path": f"{FMD}/cost-centers/cost-center-validity", "singular": "Cost Center", "statusful": True},
    {"name": "Profit Center Hierarchy", "path": f"{FMD}/profit-centers/profit-center-hierarchy", "singular": "Profit Center", "statusful": True, "tree": True},
    {"name": "Profit Center Ownership", "path": f"{FMD}/profit-centers/profit-center-ownership", "singular": "Profit Center", "statusful": True},
    {"name": "Profit Center Validity", "path": f"{FMD}/profit-centers/profit-center-validity", "singular": "Profit Center", "statusful": True},
    {"name": "Dimension Definition", "path": f"{FMD}/financial-dimensions/dimension-definition", "singular": "Dimension", "statusful": True},
    {"name": "Dimension Combinations", "path": f"{FMD}/financial-dimensions/dimension-combinations", "singular": "Combination", "statusful": True},
    {"name": "Dimension Validation", "path": f"{FMD}/financial-dimensions/dimension-validation", "singular": "Validation Rule", "statusful": True},
    {"name": "Dimension Hierarchies", "path": f"{FMD}/financial-dimensions/dimension-hierarchies", "singular": "Dimension Value", "statusful": True, "tree": True},
    {"name": "Legal Entity Structure", "path": f"{FMD}/legal-entity-finance-interface/legal-entity-structure", "singular": "Legal Entity", "statusful": True, "tree": True},
    {"name": "Intercompany Rules", "path": f"{FMD}/legal-entity-finance-interface/intercompany-rules", "singular": "Intercompany Rule", "statusful": True},
    {"name": "Consolidation Scope", "path": f"{FMD}/legal-entity-finance-interface/consolidation-scope", "singular": "Consolidation Scope", "statusful": True},
    {"name": "Data Ownership", "path": f"{FMD}/governance/data-ownership", "singular": "Ownership Record", "statusful": True},
    {"name": "Data Quality Rules", "path": f"{FMD}/governance/data-quality-rules", "singular": "Data Quality Rule", "statusful": True},
    {"name": "Change Control", "path": f"{FMD}/governance/change-control", "singular": "Change Request", "statusful": False},
]

AREAS = [
    {"name": "Chart Of Accounts", "path": f"{FMD}/chart-of-accounts", "leaves": ["Account Structure", "Account Hierarchy", "Account Types", "Account Control Rules"]},
    {"name": "Cost Centers", "path": f"{FMD}/cost-centers", "leaves": ["Cost Center Hierarchy", "Cost Center Ownership", "Cost Center Validity"]},
    {"name": "Profit Centers", "path": f"{FMD}/profit-centers", "leaves": ["Profit Center Hierarchy", "Profit Center Ownership", "Profit Center Validity"]},
    {"name": "Financial Dimensions", "path": f"{FMD}/financial-dimensions", "leaves": ["Dimension Definition", "Dimension Combinations", "Dimension Validation", "Dimension Hierarchies"]},
    {"name": "Legal Entity Finance Interface", "path": f"{FMD}/legal-entity-finance-interface", "leaves": ["Legal Entity Structure", "Intercompany Rules", "Consolidation Scope"]},
    {"name": "Financial Master Data Governance", "path": f"{FMD}/governance", "leaves": ["Data Ownership", "Data Quality Rules", "Change Control"]},
]


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def result_template(page_def):
    if page_def.get("kind") == "dashboard":
        return {
            "page": page_def["name"],
            "create": "NOT APPLICABLE",
            "read": "FAIL",
            "update": "NOT APPLICABLE",
            "deactivate_reactivate": "NOT APPLICABLE",
            "delete": "NOT APPLICABLE",
            "persistence": "NOT APPLICABLE",
            "final": "FAIL",
        }
    return {
        "page": page_def["name"],
        "create": "FAIL",
        "read": "FAIL",
        "update": "FAIL",
        "deactivate_reactivate": "NOT APPLICABLE" if not page_def["statusful"] else "FAIL",
        "delete": "FAIL",
        "persistence": "FAIL",
        "final": "FAIL",
    }


async def wait_for_page(page, name):
    await page.get_by_role("heading", name=name, exact=True).first.wait_for(state="visible", timeout=15000)


async def search_for(page, marker):
    search = page.get_by_role("search").locator("input").first
    await search.fill(marker)


def record_rows(page, tree):
    selector = "tbody tr[role='treeitem']" if tree else "tbody tr"
    return page.locator(selector)


async def find_record(page, page_def, marker, visible=True):
    await search_for(page, marker)
    row = record_rows(page, page_def.get("tree", False)).filter(has_text=marker).first
    if visible:
        await row.wait_for(state="visible", timeout=10000)
    return row


async def open_row_menu(row):
    trigger = row.locator("button[aria-label^='Actions for ']").first
    await trigger.click()


async def select_menu_action(page, row, action):
    await open_row_menu(row)
    await page.get_by_role("menuitem", name=action, exact=True).click()


async def fill_form(page, page_def, marker):
    form = page.locator("#record-form")
    await form.wait_for(state="visible", timeout=10000)

    for field in await form.locator("input[id^='f-'], textarea[id^='f-']").all():
        field_id = await field.get_attribute("id")
        if not field_id:
            continue
        input_type = await field.get_attribute("type") or "text"
        field_name = field_id.removeprefix("f-")
        if input_type == "date":
            await field.fill("2026-01-01")
        elif input_type == "number":
            await field.fill("1")
        elif input_type == "checkbox":
            continue
        elif input_type in ("text", "email", "url", "tel", "search") or field.evaluate("el => el.tagName === 'TEXTAREA'"):
            await field.fill(f"{marker}-{field_name}")

    for select in await form.locator("select[id^='f-']").all():
        field_id = await select.get_attribute("id")
        if not field_id:
            continue
        field_name = field_id.removeprefix("f-")
        current = await select.input_value()
        label = await form.locator(f"label[for='{field_id}']").inner_text()
        required = "*" in label
        choose_parent = page_def.get("tree", False) and field_name == "parentId"
        if current and not choose_parent:
            continue
        if not required and not choose_parent:
            continue
        options = await select.locator("option").evaluate_all(
            "els => els.map(e => ({value:e.value, disabled:e.disabled})).filter(e => e.value && !e.disabled)"
        )
        if options:
            await select.select_option(value=options[0]["value"])

    required_groups = form.locator("div[aria-invalid='false']")
    checkboxes = form.locator("input[type='checkbox']:not([aria-hidden='true'])")
    if await checkboxes.count():
        # Ref-multi fields are rendered as checkbox lists; selecting one makes
        # the required consolidation-entity reference valid.
        await checkboxes.first.check()

    if page_def["name"] == "Intercompany Rules":
        from_select = form.locator("#f-fromEntity")
        to_select = form.locator("#f-toEntity")
        from_value = await from_select.input_value()
        other_values = await to_select.locator("option").evaluate_all(
            "els => els.map(e => e.value).filter(v => v)"
        )
        alternative = next((v for v in other_values if v != from_value), None)
        require(alternative is not None, "Intercompany form has no second legal-entity option")
        await to_select.select_option(value=alternative)

    return form


async def verify_dashboard(page):
    await page.goto(f"{BASE_URL}{FMD}", wait_until="domcontentloaded")
    await wait_for_page(page, "Financial Master Data")
    rows = page.locator("main table tbody tr")
    require(await rows.count() == 6, f"Expected six functional areas; found {await rows.count()}")
    for area in AREAS:
        require(await page.locator(f"a[href='{area['path']}']").count() > 0, f"Dashboard missing link to {area['name']}")
    return {**result_template(PAGES[0]), "read": "PASS", "final": "PASS"}


async def verify_crud_page(page, page_def):
    result = result_template(page_def)
    stage = "open page"
    page_slug = re.sub(r"[^a-z0-9]+", "-", page_def["name"].lower()).strip("-")
    marker = f"{RUN_ID}-{page_slug}"
    try:
        await page.goto(f"{BASE_URL}{page_def['path']}", wait_until="domcontentloaded")
        await wait_for_page(page, page_def["name"])

        stage = "create"
        await page.get_by_role("button", name=f"New {page_def['singular']}", exact=True).click()
        form = await fill_form(page, page_def, marker)
        await page.get_by_role("button", name="Save", exact=True).click()
        await form.wait_for(state="hidden", timeout=10000)
        row = await find_record(page, page_def, marker)
        result["create"] = "PASS"
        if page_def.get("tree"):
            level = await row.get_attribute("aria-level")
            require(level and int(level) > 1, "New hierarchy record did not appear beneath a parent")

        stage = "read details"
        await select_menu_action(page, row, "View details")
        detail_heading = page.get_by_role("heading").filter(has_text=marker).first
        await detail_heading.wait_for(state="visible", timeout=10000)
        result["read"] = "PASS"

        if page_def["name"] == "Change Control":
            for action in ["Submit", "Start Review", "Approve", "Mark Implemented"]:
                stage = f"change lifecycle: {action}"
                await page.get_by_role("button", name=action, exact=True).click()
            require(await page.get_by_text("Implemented", exact=True).count() > 0, "Change request did not reach Implemented")

        stage = "edit"
        await page.get_by_role("button", name="Edit", exact=True).last.click()
        form = page.locator("#record-form")
        await form.wait_for(state="visible", timeout=10000)
        first_text = form.locator("input[type='text']").first
        old_value = await first_text.input_value()
        require(old_value.startswith(marker), "Edit form did not load the created test record")
        edited_value = f"{old_value}-EDIT"
        await first_text.fill(edited_value)
        await page.get_by_role("button", name="Save", exact=True).click()
        await form.wait_for(state="hidden", timeout=10000)
        await page.get_by_role("heading").filter(has_text=edited_value).wait_for(state="visible", timeout=10000)
        result["update"] = "PASS"

        stage = "close details"
        await page.get_by_role("button", name="Close", exact=True).last.click()
        await page.get_by_role("button", name=f"New {page_def['singular']}", exact=True).wait_for(state="visible")

        if page_def["statusful"]:
            stage = "deactivate"
            row = await find_record(page, page_def, marker)
            await select_menu_action(page, row, "Deactivate")
            row = await find_record(page, page_def, marker)
            require(await row.get_by_text("Inactive", exact=True).count() > 0, "Record did not show Inactive after deactivation")

            stage = "reactivate"
            row = await find_record(page, page_def, marker)
            await select_menu_action(page, row, "Activate")
            row = await find_record(page, page_def, marker)
            require(await row.get_by_text("Active", exact=True).count() > 0, "Record did not show Active after reactivation")
            result["deactivate_reactivate"] = "PASS"

        stage = "persistence after reload"
        await page.reload(wait_until="domcontentloaded")
        await wait_for_page(page, page_def["name"])
        row = await find_record(page, page_def, marker)
        require(await row.get_by_text("Active", exact=True).count() > 0 if page_def["statusful"] else True, "Reactivated status was not persisted")
        result["persistence"] = "PASS"

        stage = "delete"
        await select_menu_action(page, row, "Delete")
        alert = page.get_by_role("alertdialog")
        await alert.wait_for(state="visible", timeout=10000)
        require("Record is in use" not in (await alert.inner_text()), "Isolated test record unexpectedly has references")
        await alert.get_by_role("button", name="Delete", exact=True).click()
        await row.wait_for(state="detached", timeout=10000)
        result["delete"] = "PASS"

        stage = "persistence after delete"
        await page.reload(wait_until="domcontentloaded")
        await wait_for_page(page, page_def["name"])
        await search_for(page, marker)
        require(await record_rows(page, page_def.get("tree", False)).filter(has_text=marker).count() == 0, "Deleted record returned after reload")
        result["final"] = "PASS"
    except Exception as error:
        result["error"] = f"{stage}: {type(error).__name__}: {error}"
        result["traceback"] = traceback.format_exc()
        try:
            safe_name = re.sub(r"[^a-z0-9]+", "_", page_def["name"].lower()).strip("_")
            await page.screenshot(path=str(SCREENSHOTS / f"{safe_name}.png"), full_page=False)
        except Exception:
            pass
    return result


async def guardrail_check(page, name, operation):
    try:
        await operation()
        return {"check": name, "result": "PASS"}
    except Exception as error:
        try:
            safe_name = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
            await page.screenshot(path=str(SCREENSHOTS / f"guardrail_{safe_name}.png"), full_page=False)
        except Exception:
            pass
        return {"check": name, "result": "FAIL", "error": f"{type(error).__name__}: {error}", "traceback": traceback.format_exc()}


async def open_new(page, path, singular):
    await page.goto(f"{BASE_URL}{path}", wait_until="domcontentloaded")
    await page.get_by_role("button", name=f"New {singular}", exact=True).click()
    await page.locator("#record-form").wait_for(state="visible")
    return page.locator("#record-form")


async def check_required_field(page):
    form = await open_new(page, f"{FMD}/chart-of-accounts/account-structure", "Account")
    await fill_form(page, PAGES[1], f"{RUN_ID}-REQ")
    await form.locator("#f-code").fill("")
    await page.get_by_role("button", name="Save", exact=True).click()
    await page.get_by_role("alert").filter(has_text="Account Code is required.").wait_for()
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_duplicate_account_code(page):
    form = await open_new(page, f"{FMD}/chart-of-accounts/account-structure", "Account")
    await fill_form(page, PAGES[1], f"{RUN_ID}-DUP")
    await form.locator("#f-code").fill("1000")
    await page.get_by_role("button", name="Save", exact=True).click()
    await page.get_by_role("alert").filter(has_text="already exists.").wait_for()
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_invalid_date_range(page):
    form = await open_new(page, f"{FMD}/chart-of-accounts/account-structure", "Account")
    await fill_form(page, PAGES[1], f"{RUN_ID}-DATE")
    await form.locator("#f-effectiveFrom").fill("2026-12-31")
    await form.locator("#f-effectiveTo").fill("2026-01-01")
    await page.get_by_role("button", name="Save", exact=True).click()
    await page.get_by_role("alert").filter(has_text="End date cannot be before start date.").wait_for()
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_hierarchy_cycle(page):
    page_def = next(p for p in PAGES if p["name"] == "Account Hierarchy")
    await page.goto(f"{BASE_URL}{page_def['path']}", wait_until="domcontentloaded")
    await wait_for_page(page, page_def["name"])
    row = await find_record(page, page_def, "1000")
    await select_menu_action(page, row, "Edit")
    form = page.locator("#record-form")
    parent = form.locator("#f-parentId")
    option = parent.locator("option").filter(has_text="1100 Current Assets")
    require(await option.count() == 0, "A descendant account was offered as its own ancestor")
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_referenced_delete_block(page):
    page_def = PAGES[1]
    await page.goto(f"{BASE_URL}{page_def['path']}", wait_until="domcontentloaded")
    await wait_for_page(page, page_def["name"])
    row = await find_record(page, page_def, "1000")
    await select_menu_action(page, row, "Delete")
    alert = page.get_by_role("alertdialog")
    await alert.wait_for(state="visible")
    require("Record is in use" in await alert.inner_text(), "Referenced account was not protected from deletion")
    require(await alert.get_by_role("button", name="Delete", exact=True).count() == 0, "Blocked deletion still offered a Delete action")
    await alert.get_by_role("button", name="Close", exact=True).click()


async def check_same_entity_rejected(page):
    path = f"{FMD}/legal-entity-finance-interface/intercompany-rules"
    form = await open_new(page, path, "Intercompany Rule")
    await fill_form(page, next(p for p in PAGES if p["name"] == "Intercompany Rules"), f"{RUN_ID}-IC")
    await form.locator("#f-toEntity").select_option(value=await form.locator("#f-fromEntity").input_value())
    await page.get_by_role("button", name="Save", exact=True).click()
    await page.get_by_role("alert").filter(has_text="From and To entity must differ.").wait_for()
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_reference_scope(page):
    path = f"{FMD}/financial-dimensions/dimension-hierarchies"
    form = await open_new(page, path, "Dimension Value")
    dimension = form.locator("#f-dimension")
    values = await dimension.locator("option").evaluate_all("els => els.map(e => ({value:e.value, text:e.textContent || ''}))")
    project = next((option for option in values if "PRJ Project" in option["text"]), None)
    require(project is not None, "Project dimension option missing")
    await dimension.select_option(value=project["value"])
    parent = form.locator("#f-parentId")
    parent_values = await parent.locator("option").evaluate_all("els => els.map(e => ({value:e.value, text:e.textContent || ''}))")
    require(any(option["value"] == "dv-prj" for option in parent_values), "Same-dimension parent was not offered")
    require(not any(option["value"] == "dv-reg" for option in parent_values), "Cross-dimension parent was incorrectly offered")
    await page.get_by_role("button", name="Cancel", exact=True).click()


async def check_area_pages(page):
    outcomes = []
    for area in AREAS:
        await page.goto(f"{BASE_URL}{area['path']}", wait_until="domcontentloaded")
        await wait_for_page(page, area["name"])
        for leaf in area["leaves"]:
            link = page.get_by_role("link", name=leaf, exact=True).first
            await link.wait_for(state="visible", timeout=10000)
        outcomes.append({"area": area["name"], "read_and_navigation": "PASS"})
    return outcomes


async def main():
    page_results = []
    guardrails = []
    area_results = []
    page_errors = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()
        page.set_default_timeout(10000)
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        try:
            page_results.append(await verify_dashboard(page))
        except Exception as error:
            page_results.append({**result_template(PAGES[0]), "error": f"{type(error).__name__}: {error}"})

        for page_def in PAGES[1:]:
            outcome = await verify_crud_page(page, page_def)
            page_results.append(outcome)
            status = outcome.get("final", "FAIL")
            print(f"{'PASS' if status == 'PASS' else 'FAIL'}  {page_def['name']}: " + ", ".join(
                f"{key}={outcome.get(key, 'NOT APPLICABLE')}" for key in
                ["create", "read", "update", "deactivate_reactivate", "delete", "persistence"]
            ))

        guardrail_checks = [
            ("Required field rejection", check_required_field),
            ("Duplicate account code rejection", check_duplicate_account_code),
            ("Invalid date-range rejection", check_invalid_date_range),
            ("Hierarchy-cycle rejection", check_hierarchy_cycle),
            ("Referenced-record delete blocked", check_referenced_delete_block),
            ("Identical intercompany entities rejected", check_same_entity_rejected),
            ("Reference limited to same dimension", check_reference_scope),
        ]
        for name, operation in guardrail_checks:
            outcome = await guardrail_check(page, name, lambda op=operation: op(page))
            guardrails.append(outcome)
            print(f"{'PASS' if outcome['result'] == 'PASS' else 'FAIL'}  Guardrail: {name}")

        try:
            area_results = await check_area_pages(page)
            for outcome in area_results:
                print(f"PASS  Area route: {outcome['area']} — read/navigation")
        except Exception as error:
            area_results.append({"area": "Area page navigation", "read_and_navigation": "FAIL", "error": f"{type(error).__name__}: {error}"})
            print(f"FAIL  Area page navigation: {type(error).__name__}: {error}")

        await context.close()
        await browser.close()

    report = {
        "run_id": RUN_ID,
        "base_url": BASE_URL,
        "pages": page_results,
        "guardrails": guardrails,
        "area_routes": area_results,
        "page_errors": page_errors,
        "overall": "VERIFIED" if all(p.get("final") == "PASS" for p in page_results) and all(g["result"] == "PASS" for g in guardrails) and all(a.get("read_and_navigation") == "PASS" for a in area_results) and not page_errors else "NOT VERIFIED",
    }
    report_path = OUTPUT / "report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nOverall: {report['overall']}")
    print(f"Report: {report_path}")
    print(f"Failure screenshots: {SCREENSHOTS}")
    print(f"Browser page errors: {len(page_errors)}")
    if page_errors:
        for error in page_errors:
            print(f"  {error}")
    return 0 if report["overall"] == "VERIFIED" else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))