# Acceptance Guide

## Step 1 - User Registration

Open:

http://localhost:3000/register

Verification:

* Register a new account
* Select role
* Registration succeeds

Expected Result:

User account created successfully.

---

## Step 2 - User Login

Open:

http://localhost:3000/login

Verification:

* Login with test account
* JWT token generated

Expected Result:

User redirected to Home Page.

---

## Step 3 - Browse Games

Open:

Home Page

Verification:

* View game list
* View cover images
* View tags
* View play statistics

Expected Result:

At least three games are displayed.

---

## Step 4 - Search Games

Verification:

* Search by title
* Search by description
* Search by tags

Expected Result:

Matching games are filtered correctly.

---

## Step 5 - Game Detail

Verification:

* Open Detail Page
* View metadata
* View live preview

Expected Result:

Game information displayed correctly.

---

## Step 6 - Play Game

Verification:

* Click Play
* Launch generated HTML5 game

Expected Result:

Game loads successfully.

Play count increases by 1.

---

## Step 7 - Like Game

Verification:

* Click Like

Expected Result:

Like count increases.

Like state changes.

---

## Step 8 - Favorite Game

Verification:

* Click Favorite

Expected Result:

Favorite count increases.

Favorite state changes.

---

## Step 9 - Create Game

Verification:

* Enter game prompt
* Submit generation request

Expected Result:

Multi-Agent workflow executes successfully.

Generated game appears in history.

---

## Step 10 - View History

Verification:

* Open History Page

Expected Result:

Generation records displayed.

Status and logs available.

---

## Step 11 - Permission Validation

Verification:

Login as Player

Expected Result:

Create page unavailable.

Login as Creator

Expected Result:

Create page available.

---

## Final Acceptance Checklist

✓ Registration

✓ Login

✓ RBAC

✓ Home Page

✓ Search

✓ Create

✓ History

✓ Play

✓ Like

✓ Favorite

✓ Multi-Agent Workflow

✓ Generated HTML Game

✓ Auto Tags

✓ Auto Cover
