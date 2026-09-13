# Finance Board

Build a complete responsive web application called Personal Financial Board.

This is a simple personal finance planning and reporting application.

The application is NOT an AI product and must NOT contain:

AI

machine learning

predictions

recommendations

automatic financial advice

automatic transaction classification

anomaly detection

forecasting

intelligent budgeting

complex accounting automation

The user manually enters and classifies financial items. The application performs only deterministic calculations, displays them clearly, and provides simple charts.

The primary interaction is a horizontal Kanban-style financial planning board.

1. PRODUCT STRUCTURE

The application has three primary areas:

Planning

Reporting

Categories

The main navigation should be visible at the top or in a clean left sidebar depending on the responsive layout.

Primary navigation:

Planning

Reporting

Categories

Secondary actions:

Accounts

Add Transaction

Settings

The default landing page must be Planning.

2. VISUAL DESIGN

Create a polished modern personal finance dashboard.

Design principles:

Clean

Minimal

Practical

Information-dense without being cluttered

Desktop-first but fully responsive

Strong visual hierarchy

Cards with subtle borders and shadows

Rounded corners

Neutral background

Clear typography

Category colors used consistently

Green for positive/income values

Red for negative/expense values

Neutral colors for transfers and informational values

Do not make it look like a corporate ERP.

It should feel like a personal financial workspace.

Use a light interface as the primary theme.

Support dark mode structurally if easy, but do not let dark mode complicate the implementation.

Use EGP as the default currency and display amounts such as:

3,000 EGP
-500 EGP

The currency should eventually be configurable.

3. GLOBAL APPLICATION HEADER

Create a top header containing:

Left:

Personal Financial Board

Center/right navigation:

Planning

Reporting

Categories

Right side:

Account summary / balance indicator

Add Transaction button

User/settings icon

The primary CTA must be:

+ Add Transaction

4. PLANNING PAGE

Planning is the main page.

The page should contain:

Page header

Account summary

Planning controls

Horizontal financial board

Board totals

4.1 Planning header

Display:

Planning

Subtitle:

Plan and organize your money across time.

Right side:

+ Add Transaction

Period selector

Optional view controls

Period selector options:

Week

Month

Custom

For the initial UI, use the month view.

Example:

September 2026

with previous/next month buttons.

5. ACCOUNT SUMMARY

Immediately below the page header, display account summary cards.

Example:

CASH
4,650 EGP

BANK
3,000 EGP

WALLET
465 EGP

SAVINGS
2,000 EGP

TOTAL
10,115 EGP


Create horizontal summary cards.

Each account card contains:

Account name

Account type

Current balance

Optional small icon

The Total card should be visually emphasized.

Add an:

Manage Accounts

action.

Do not create complex banking functionality.

Accounts are simply user-defined containers for money.

6. PLANNING BOARD CONTROLS

Above the board, create a compact control bar.

Include:

Current month

Previous/next period buttons

+ Add Column

Search

Category filter

Account filter

Optional status filter

Keep these controls visually lightweight.

7. HORIZONTAL KANBAN BOARD

This is the most important UI component.

Create a horizontally scrollable board.

The board should resemble a Kanban board, but each column represents a financial time period rather than a workflow status.

Example columns:

15 SEP
16–20 SEP
21–25 SEP
26–30 SEP
OCTOBER


Each column contains financial transaction cards.

The board must support:

Horizontal scrolling

Dragging cards vertically

Dragging cards between columns

Reordering cards

Dropping a card into another period

Use a proper drag-and-drop interaction.

Do not implement fake buttons pretending to be drag-and-drop.

Use a suitable React drag/drop library such as dnd-kit.

8. BOARD COLUMN DESIGN

Each column contains:

Header

Example:

15 SEP

Small date range underneath.

Example:

Sep 15, 2026

Column header should include:

Column name

Date range

Optional three-dot menu

Three-dot menu:

Rename

Edit dates

Delete

Deleting a column should require confirmation if it contains transactions.

9. TRANSACTION CARDS

Transaction cards are the primary objects on the board.

Each card should show:

Amazon

-500 EGP

Shopping
Cash

Expense


Visual structure:

Category color indicator on the left

Transaction title

Amount

Category badge

Account

Accounting type

Optional small date indicator.

Positive amounts should visually indicate income.

Negative amounts should visually indicate expenses.

Transfers should use a neutral visual treatment.

Cards should be compact enough that many can fit in a column.

Clicking a card opens an edit modal/drawer.

10. TRANSACTION CREATION / EDITING

The Add Transaction button opens a modal or right-side drawer.

Title:

Add Transaction

Fields:

Name

Text input.

Example:

Amazon

Amount

Numeric input.

Example:

500

Direction

Segmented control:

IN

OUT

Date

Date picker.

Planning Period

Select one of the existing board columns.

Account

Dropdown.

Example:

Cash

Bank

Wallet

Savings

Category

Dropdown.

Example:

Food

Transportation

Shopping

Health

Housing

Entertainment

Subscriptions

Education

Other

Accounting Type

Dropdown:

Income

Expense

Transfer

Asset Purchase

Debt

Debt Payment

Adjustment

Other

Cash Flow Type

Dropdown:

Operating

Investing

Financing

Transfer

Other

Notes

Optional multiline text field.

Buttons:

Cancel

Save Transaction

There must be no automatic classification.

The user explicitly chooses the category, accounting type, and cash-flow type.

11. TRANSFERS

Support simple account transfers.

Example:

Bank → Cash
1,000 EGP


When Accounting Type is:

Transfer

show:

From Account

To Account

Amount

Date

Planning Period

Transfers must not be treated as income or expenses.

They only move money between accounts.

Keep this implementation simple.

12. COLUMN CALCULATIONS

Every board column has a footer.

Display:

IN       3,000 EGP
OUT     -1,005 EGP
────────────────────
NET       1,995 EGP

OPENING  5,000 EGP
CLOSING  6,995 EGP


Calculations:

IN = sum of incoming transactions

OUT = sum of outgoing transactions

NET = IN + OUT

CLOSING = OPENING + NET


The opening balance of a subsequent period should correspond to the previous period's closing balance.

For the UI prototype, seed sensible demo values.

13. BOARD SUMMARY

Above or below the board, show a compact overall summary:

PLANNED INCOME       8,000 EGP
PLANNED EXPENSES    -5,250 EGP
NET                  2,750 EGP


Also show:

OPENING BALANCE      6,000 EGP
PLANNED CLOSING      8,750 EGP


These values should update when cards are added, edited, moved, or deleted.

14. REPORTING PAGE

Create a dedicated Reporting page.

Reporting must contain four sections:

Income Statement

Balance Sheet

Cash Flow Statement

Charts

Use tabs or a segmented navigation inside Reporting:

Income Statement | Balance Sheet | Cash Flow | Charts


15. INCOME STATEMENT

Create a clean financial statement view.

Header:

Income Statement

Period selector:

September 2026

Display:

Income

Salary                  3,000
Other Income              500
──────────────────────────────
Total Income             3,500


Expenses

Food                      850
Transportation            350
Shopping                  700
Health                    500
Subscriptions             200
──────────────────────────────
Total Expenses           2,600


Result

NET INCOME                 900


Use strong visual hierarchy.

Add a small simple chart showing:

Income vs Expenses

No interpretation or recommendations.

16. BALANCE SHEET

Create:

Balance Sheet

Show:

Assets

Cash                    4,650
Bank                    3,000
Wallet                    465
Savings                 2,000
────────────────────────
Total Assets           10,115


Liabilities

Credit Card             1,200
Other Debt                500
────────────────────────
Total Liabilities       1,700


Net Position

NET POSITION             8,415


Keep the calculations simple.

Do not build a complex double-entry accounting engine.

17. CASH FLOW STATEMENT

Create:

Cash Flow Statement

Show:

Opening Cash

6,000 EGP


Operating Cash Flow

Income                 +3,500
Expenses               -2,600
────────────────────────────
Operating Cash Flow      +900


Investing Cash Flow

Asset Purchases          -500


Financing Cash Flow

Debt / Financing         +500


Net Change

+900 EGP


Closing Cash

6,900 EGP


All values are derived from the transaction classifications selected by the user.

18. CATEGORIES PAGE

Create a dedicated Categories page.

Header:

Categories

Subtitle:

Organize transactions and compare planned versus actual spending.

Display a category table.

Columns:

CATEGORY
COLOR
PLANNED
ACTUAL
DIFFERENCE


Example:

Food                 2,000     1,750      +250
Transportation       1,000     1,150      -150
Shopping              1,500       900      +600
Health                  800       650      +150
Subscriptions           500       500         0


Use visual positive/negative indicators.

19. CATEGORY MANAGEMENT

Add:

+ Add Category

Category creation modal:

Name

Color

Optional:

Icon

Buttons:

Cancel / Save

Each category row has a three-dot menu:

Edit

Change color

Delete

If a category has transactions, deletion should require confirmation.

Do not automatically move transactions to another category.

20. CATEGORY ANALYSIS

Below the category table, add simple visualizations:

Spending by Category

Bar chart or donut chart.

Planned vs Actual

Bar chart comparing:

Food
Transportation
Shopping
Health
Subscriptions


No AI interpretation.

No generated explanations.

No recommendations.

21. CHARTS PAGE

Inside Reporting → Charts, create a clean dashboard.

Include four charts.

Chart 1 — Cash Flow Over Time

Line or bar chart.

X axis:

Time periods.

Y axis:

EGP.

Show:

Income

Expenses

Net

Chart 2 — Income vs Expenses

Two-series bar chart.

Chart 3 — Spending by Category

Donut or bar chart.

Chart 4 — Account Balances

Bar chart.

Accounts:

Cash

Bank

Wallet

Savings

Charts must be simple visualizations only.

22. ACCOUNTS VIEW

Create an Accounts management interface accessible from the account summary.

Header:

Accounts

Show cards/table:

ACCOUNT       TYPE          BALANCE

Cash          Cash          4,650 EGP
Bank          Bank          3,000 EGP
Wallet        Wallet          465 EGP
Savings       Savings       2,000 EGP


Button:

+ Add Account

Add Account fields:

Name

Type

Opening Balance

Currency

Account types:

Cash

Bank

Wallet

Savings

Credit Card

Other

Allow:

Edit

Delete

23. SETTINGS

Create a minimal Settings page.

Settings:

General

Default currency

Default planning period

Theme

Categories

Link to Categories.

Accounts

Link to Accounts.

Do not add unnecessary configuration.

24. RESPONSIVE DESIGN

Desktop is the primary target.

On desktop:

Full horizontal board

Multiple columns visible

Sidebar or top navigation

Large charts

On tablet:

Horizontally scrollable board

Compact navigation

Cards remain usable

On mobile:

Single column viewport

Board remains horizontally scrollable

Transaction cards remain readable

Summary cards become horizontally scrollable

Forms become full-screen or bottom-sheet style

Do not destroy the Kanban interaction on mobile.

25. DEMO DATA

Populate the UI with realistic demo data so the application looks complete immediately.

Accounts:

Cash       4,650 EGP
Bank       3,000 EGP
Wallet       465 EGP
Savings    2,000 EGP


Categories:

Income
Food
Transportation
Housing
Health
Shopping
Entertainment
Subscriptions
Education
Savings
Other


Example transactions:

Salary             +3,000     Income
Food                -300      Food
Transportation      -100      Transportation
Internet            -155      Subscriptions
Gym                 -350      Health
Amazon              -500      Shopping
Shopping            -700      Shopping
Rent              -2,000      Housing


Distribute them across several planning columns.

The demo data must demonstrate:

income

expenses

transfers

multiple categories

multiple accounts

different periods

reporting calculations

charts

26. CALCULATION RULES

Implement only deterministic arithmetic.

Transaction amount

Store the amount as a positive numeric value internally.

Direction determines its effect.

IN  → +amount
OUT → -amount


Column

IN = sum(IN transactions)

OUT = sum(OUT transactions)

NET = IN - OUT

CLOSING = OPENING + NET


Income Statement

Total Income
= transactions where Accounting Type = Income

Total Expenses
= transactions where Accounting Type = Expense

Net Income
= Total Income - Total Expenses


Transfers

Transfers must not contribute to income or expenses.

Account balance

Opening Balance
+ incoming transactions
- outgoing transactions
+/- transfers
= Current Balance


Category totals

Group transactions by manually selected category.

Do not infer categories.

27. DATA ARCHITECTURE

For this first version, create the UI with a clean data model that can later be connected to Firebase.

Use TypeScript interfaces.

Create:

Account
Category
PlanningColumn
Transaction


Suggested Transaction structure:

id
title
amount
currency
date
columnId
accountId
categoryId
direction
accountingType
cashflowType
notes
createdAt
updatedAt


Account:

id
name
type
openingBalance
currency


Category:

id
name
color


PlanningColumn:

id
name
startDate
endDate
order


28. STATE MANAGEMENT

For the UI prototype, use local application state.

The application must behave as a functioning prototype:

Add transaction

Edit transaction

Delete transaction

Drag transaction

Change column

Change category

Change account

Add category

Edit category

Delete category

Add account

Edit account

Delete account

All calculated values should update immediately.

Structure the code so Firebase can replace local persistence later without rewriting the UI.

29. FIREBASE PREPARATION

Do NOT make Firebase integration the priority of this first UI build.

Create clean service boundaries such as:

services/
  transactions
  accounts
  categories
  planningColumns


The UI should consume data through these abstractions where practical.

Later we will connect:

Firebase Authentication

Firestore

Do not introduce unnecessary backend infrastructure.

30. DRAG AND DROP REQUIREMENTS

Use dnd-kit or an equivalent mature React drag-and-drop library.

Requirements:

Cards are draggable

Columns are droppable

Cards can move between columns

Cards can reorder inside columns

Drag state has visual feedback

Drop target is clearly visible

No accidental deletion

Touch interaction should be considered

When a card moves to another planning column, update its columnId.

Do not change its category, account, or accounting type automatically.

31. UI STATES

Every major view should have:

populated state

empty state

loading state

error state

Example empty Planning state:

No transactions planned yet.

Add your first transaction to start planning your money.

+ Add Transaction


Empty Categories:

No categories yet.

Create a category to organize your transactions.

+ Add Category


32. MODALS AND CONFIRMATIONS

Use consistent modal/drawer components.

Delete actions should show confirmation.

Example:

Delete Transaction?

This will permanently remove the transaction.

Buttons:

Cancel
Delete

Do not use browser-native alert dialogs unless necessary.

33. ACCESSIBILITY

Use:

semantic buttons

keyboard navigation

visible focus states

accessible labels

readable contrast

keyboard-accessible forms

accessible drag/drop interactions where possible

Do not sacrifice accessibility for visual effects.

34. PERFORMANCE

Keep the application lightweight.

Do not add:

large UI frameworks unnecessarily

animation libraries unless needed

complex state management

unnecessary dependencies

Use efficient React rendering.

35. IMPORTANT PRODUCT RULE

The application must always remain a simple financial board and calculator.

The system must never:

tell the user what they should buy

tell the user what they should not buy

predict future spending

predict income

classify transactions automatically

recommend financial actions

analyze behavior using AI

generate financial advice

The user controls the data.

The application calculates and displays the data.

36. FINAL UI HIERARCHY

The completed application should feel like this:

PERSONAL FINANCIAL BOARD
│
├── PLANNING
│   │
│   ├── Account Summary
│   │
│   ├── Planning Controls
│   │
│   └── Horizontal Kanban Board
│       ├── Period 1
│       ├── Period 2
│       ├── Period 3
│       ├── Period 4
│       └── Period 5
│
├── REPORTING
│   │
│   ├── Income Statement
│   ├── Balance Sheet
│   ├── Cash Flow Statement
│   └── Charts
│
├── CATEGORIES
│   │
│   ├── Category List
│   ├── Planned vs Actual
│   └── Category Charts
│
├── ACCOUNTS
│
└── SETTINGS


37. DELIVERABLE

Generate the complete polished frontend now.

The result should be a fully navigable working prototype, not a static mockup.

The user should be able to:

Open Planning.

See accounts.

See the horizontal financial Kanban board.

Add transactions.

Edit transactions.

Delete transactions.

Drag transactions between periods.

See calculations update.

Open Reporting.

View Income Statement.

View Balance Sheet.

View Cash Flow Statement.

View Charts.

Open Categories.

Create/edit/delete categories.

Open Accounts.

Create/edit/delete accounts.

Navigate between all sections.

Use realistic demo data.

Make the Planning board the strongest and most polished part of the application.

Do not build Firebase integration yet.

Do not add AI or intelligent features.

Do not add features outside this specification.

Focus on making the complete UI functional, clean, coherent, and ready for the next phase where Firebase persistence will be connected.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d96a341f-fab3-4ee3-b15d-7e703e0bea54).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
