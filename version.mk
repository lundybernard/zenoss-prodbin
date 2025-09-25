BRANCH_NAME = $(shell git rev-parse --abbrev-ref HEAD)

ifeq ($(BRANCH_NAME),HEAD)
NAME = $(shell git name-rev --name-only HEAD)
NAME_PARTS = $(subst ~, ,$(subst ^, ,$(NAME)))
ifeq ($(words $(NAME_PARTS)),1)
TAG = 1
else
TAG = 0
VERSION_BRANCH = $(shell git rev-parse --short HEAD)
endif
else
TAG = 0
UPSTREAM = $(shell git config --get branch.$(BRANCH_NAME).merge)
ifeq ($(UPSTREAM),)
BRANCH ?= $(BRANCH_NAME)
else
BRANCH ?= $(shell git rev-parse --symbolic-full-name --abbrev-ref @{upstream})
endif
VERSION_BRANCH = $(shell basename "$(BRANCH_NAME)" | tr A-Z-_ a-z.)
endif  # for ifeq ($(BRANCH_NAME),HEAD)

DESCRIBE = $(shell git describe --tags --long --always $(BRANCH))
DESC_LIST = $(subst -, ,$(DESCRIBE))
ifeq ($(words $(DESC_LIST)),3)
COUNT = $(word 2,$(DESC_LIST))
SHA = $(word 3,$(DESC_LIST))
else
COUNT = $(shell git rev-list --count $(BRANCH))
SHA = $(word 1,$(DESC_LIST))
endif

REV_SUFFIX = $(or\
	$(if $(findstring 1,$(TAG)),""),\
	$(if $(findstring master,$(BRANCH)),""),\
	$(if $(findstring develop,$(BRANCH)),.dev$(COUNT)),\
	$(if $(findstring release/,$(BRANCH)),rc$(COUNT)),\
	$(if $(findstring hotfix/,$(BRANCH)),rc$(COUNT)),\
	.dev$(COUNT)+$(VERSION_BRANCH)\
)
BASE_VERSION = $(shell cat VERSION)
VERSION = $(BASE_VERSION)$(REV_SUFFIX)

SDIST = prodbin-$(VERSION).tar.gz
WHEEL = prodbin-$(VERSION)-py2-none-any.whl

.PHONY: version
version:
	@echo $(VERSION)
