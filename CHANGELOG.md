# ng-dynamic-component - Changelog

## [5.0.3](https://github.com/gund/ng-dynamic-component/compare/v5.0.2...v5.0.3) (2020-01-29)


### Bug Fixes

* **dist:** add readme file to package ([e973a42](https://github.com/gund/ng-dynamic-component/commit/e973a42e4fa4c88b94e77470f45f6cabf79ecf9c))

## [5.0.2](https://github.com/gund/ng-dynamic-component/compare/v5.0.1...v5.0.2) (2020-01-29)

### Bug Fixes

- **dist:** correctly run pack script before publishing package ([d5037db](https://github.com/gund/ng-dynamic-component/commit/d5037db4dcec0776e271103af0f8b1c16792cb68))

## [5.0.1](https://github.com/gund/ng-dynamic-component/compare/v5.0.0...v5.0.1) (2020-01-29)

### Bug Fixes

- **build:** migrate to Angular CLI builder ([321cc38](https://github.com/gund/ng-dynamic-component/commit/321cc38034894e1e89255ac4bb195f883f37f24d))
- **dist:** include CHANGELOG.md into distribution package ([99f46bc](https://github.com/gund/ng-dynamic-component/commit/99f46bcf2ef79c1f7cb9efc08f21fc506cbfbf8c))

## [5.0.0](https://github.com/gund/ng-dynamic-component/compare/v4.0.0...v5.0.0) (2019-07-02)

### Bug Fixes

- **attributes:** do not crash when component does not exist ([723c240](https://github.com/gund/ng-dynamic-component/commit/723c240034b637d0db3f656b7ce0ffabaa486e44))
- **build:** removing types, conflicting ([4e626f3](https://github.com/gund/ng-dynamic-component/commit/4e626f322a0b1c2eb286fd5b43b8044a61a926bd)), closes [#260](https://github.com/gund/ng-dynamic-component/issues/260)
- **directives:** fire ngDoCheck hook for dynamic directives ([d3e5888](https://github.com/gund/ng-dynamic-component/commit/d3e58883fe35b31dac349529fa3fd790ef83e974))
- **directives:** recreate directives when component changes ([85f10db](https://github.com/gund/ng-dynamic-component/commit/85f10dba30c416da5859d7ccf4c2faf05e2d1d39))
- **husky:** fixing mistype in pre-commit ([5866158](https://github.com/gund/ng-dynamic-component/commit/5866158db55178dadec2e9c24fe694079b723671)), closes [#260](https://github.com/gund/ng-dynamic-component/issues/260)
- **io-service:** mark for check component on changes ([08df6ca](https://github.com/gund/ng-dynamic-component/commit/08df6caf64a2ca6aeb6d271cbca8fb39ae4da570))
- **tslint:** update tslint rules for new codelyzer ([9d7d964](https://github.com/gund/ng-dynamic-component/commit/9d7d96422124fffd3f2f55cb4714797dcdc71974)), closes [#260](https://github.com/gund/ng-dynamic-component/issues/260)

# [4.0.0](https://github.com/gund/ng-dynamic-component/compare/v3.1.2...v4.0.0) (2018-10-26)

### Bug Fixes

- **io-service:** make sure no errors thrown when component injector is not available ([4a0cac2](https://github.com/gund/ng-dynamic-component/commit/4a0cac2996224ad7ced819fdceda854c9f9ec198)), closes [#175](https://github.com/gund/ng-dynamic-component/issues/175) [#153](https://github.com/gund/ng-dynamic-component/issues/153)
- **module:** use window reference via DI ([1c05874](https://github.com/gund/ng-dynamic-component/commit/1c05874a8814b7e42910929d5a7f3f36f587f13a)), closes [#186](https://github.com/gund/ng-dynamic-component/issues/186)

### Features

- **core:** update to angular 7 ([a5b2e34](https://github.com/gund/ng-dynamic-component/commit/a5b2e348143ec2eef82105e15572323cac3351ad))
- **directives:** Add `ndcDynamicDirectives` directive ([147189e](https://github.com/gund/ng-dynamic-component/commit/147189e38a12a2ef10ef1abc2b843c7801b28ed8)), closes [#160](https://github.com/gund/ng-dynamic-component/issues/160)

### BREAKING CHANGES

- **core:** Library updates to angular v7. No user API changes.

# [3.0.0](https://github.com/gund/ng-dynamic-component/compare/v2.3.0...v3.0.0) (2018-05-16)

### Bug Fixes

- **attributes:** Reassign attributes if new dynamic component was set ([48bacb4](https://github.com/gund/ng-dynamic-component/commit/48bacb4b738cc22b66059d98c9dbb4d23438ed9b))
- **directive:** Check if inputs really changed when angular triggers change detection on them ([14c953c](https://github.com/gund/ng-dynamic-component/commit/14c953c6708b0a3128646a6b58f2aee6e6b1dea8)), closes [#111](https://github.com/gund/ng-dynamic-component/issues/111)
- **directive:** Check if inputs really changed when angular triggers change detection on them ([cc91db3](https://github.com/gund/ng-dynamic-component/commit/cc91db344ac74dc9e5e9d0ed04ec9be1e4d81a79)), closes [#111](https://github.com/gund/ng-dynamic-component/issues/111)
- **directive:** Update inputs changes when both comp and inputs are changed ([7a05b6a](https://github.com/gund/ng-dynamic-component/commit/7a05b6a0849d1a1cc52495a4e03832b941475a30)), closes [#88](https://github.com/gund/ng-dynamic-component/issues/88)
- **ng:** Upgrade to Angular 6, ngrx 6 and typescript ([393b739](https://github.com/gund/ng-dynamic-component/commit/393b739b7a1cb3c18eb2933d4d7ab8b65a2522ce)), closes [#139](https://github.com/gund/ng-dynamic-component/issues/139)
- **rxjs:** Remove old import from entry point ([d6ad500](https://github.com/gund/ng-dynamic-component/commit/d6ad50070eccf0eff7a02bc9ecdec018854c76c5)), closes [#125](https://github.com/gund/ng-dynamic-component/issues/125)
- **rxjs:** Use lettable operators instead of prototype mutation ([91c1cbd](https://github.com/gund/ng-dynamic-component/commit/91c1cbd3e64a198129eb38789cb2900cbbba2a9a)), closes [#118](https://github.com/gund/ng-dynamic-component/issues/118)

### Features

- **attributes:** Add dynamic attributes directive ([71f10ad](https://github.com/gund/ng-dynamic-component/commit/71f10ad36430a10622a2b4e1d41a15c17295d6dc)), closes [#120](https://github.com/gund/ng-dynamic-component/issues/120)
- **attributes:** Add support for `ngComponentOutlet` \* syntax ([2130057](https://github.com/gund/ng-dynamic-component/commit/213005730dd028d2f214ea6391e5990b87c3dad5))
- **attributes:** Add support for ndc-dynamic component ([d426a15](https://github.com/gund/ng-dynamic-component/commit/d426a15787ebf73ddf6faf5302d2ea0c27dfcff4))
- **directive:** Added component creation event ([52a1951](https://github.com/gund/ng-dynamic-component/commit/52a19513dae70db5845a425bc27af9c7883e73e7))

### BREAKING CHANGES

- **ng:** Upgraded to Angular 6. No public API changes.

## [2.1.1](https://github.com/gund/ng-dynamic-component/compare/v2.1.0...v2.1.1) (2018-04-19)

### Bug Fixes

- **directive:** Extract differ records to chages transformation to higher-order functions ([9b86e94](https://github.com/gund/ng-dynamic-component/commit/9b86e94471e15a451d42a0286b46eb09d37cf5b3))
- **directive:** Remove unhit dead code ([b06d9e7](https://github.com/gund/ng-dynamic-component/commit/b06d9e746195da7f57b4497602d84fda0b0d9d5b)), closes [tree#diff-c3JjL2R5bmFtaWMvZHluYW1pYy5kaXJlY3](https://github.com/tree/issues/diff-c3JjL2R5bmFtaWMvZHluYW1pYy5kaXJlY3)
- **directive:** Use SimpleChange instead of CustomSimpleChange ([b6a798d](https://github.com/gund/ng-dynamic-component/commit/b6a798de08f2f8ee3f276edae620c1ee34a2d6e9))

### Features

- **directive:** Add support for bound inputs and outputs ([7008156](https://github.com/gund/ng-dynamic-component/commit/70081568da4ca1b1c4d765cb248faaf2145607ef)), closes [#102](https://github.com/gund/ng-dynamic-component/issues/102)

## [2.0.3](https://github.com/gund/ng-dynamic-component/compare/v2.0.2...v2.0.3) (2017-11-07)

### Bug Fixes

- **package:** Fix path to type definition file ([0be2991](https://github.com/gund/ng-dynamic-component/commit/0be29918c2e84b3d7fab1433a4dc6d539aded76b))

## [2.0.2](https://github.com/gund/ng-dynamic-component/compare/v2.0.1...v2.0.2) (2017-11-06)

### Bug Fixes

- **build:** Downgrade to TS v2.4 to properly generate decorators ([ed26415](https://github.com/gund/ng-dynamic-component/commit/ed2641595edb77f4b45dacb41f8b22f31903a97e)), closes [#69](https://github.com/gund/ng-dynamic-component/issues/69)

## [2.0.1](https://github.com/gund/ng-dynamic-component/compare/v2.0.0...v2.0.1) (2017-11-05)

### Bug Fixes

- **package:** Fix publish path command ([40c0090](https://github.com/gund/ng-dynamic-component/commit/40c00902107402b60e4c77868ce4e254c7b82795))
- **package:** Fix published version with selamntic-release ([ce37e3b](https://github.com/gund/ng-dynamic-component/commit/ce37e3b5d74a4e7287e56860130ea2922f584efb))
- **remade:** Remove a note about tslib ([0590fa9](https://github.com/gund/ng-dynamic-component/commit/0590fa9515142914d3a88e576ca494328223b537))

# [2.0.0](https://github.com/gund/ng-dynamic-component/compare/v1.1.0...v2.0.0) (2017-11-05)

### Bug Fixes

- **build:** Create Flat ESM modules ES5 and ES2015 ([3726022](https://github.com/gund/ng-dynamic-component/commit/372602256c7212a0e4f48240231d957824e8ef91)), closes [#27](https://github.com/gund/ng-dynamic-component/issues/27)
- **build:** Publish only dist folder ([878d6b8](https://github.com/gund/ng-dynamic-component/commit/878d6b840f27535385e0255cc2e464470e4b91c3))
- **directive:** check undefined/null inputs/outputs ([d31df71](https://github.com/gund/ng-dynamic-component/commit/d31df71e61aaa1567c302dc3878cd697e4046956))
- **directive:** Correctly use ngComponentOutlet component instance ([9e36c79](https://github.com/gund/ng-dynamic-component/commit/9e36c79e7c8c8843a48cae4c7ddf4109eebbfc0a))
- **directive:** Guard NgComponentOutlet that may be not injected ([cba008d](https://github.com/gund/ng-dynamic-component/commit/cba008d4ff1ba2b34c3524c3ca18bf787edc7cd0))
- **directive:** Guard ngOnChnages invokation if not specified by dynamic component ([51c795b](https://github.com/gund/ng-dynamic-component/commit/51c795b9b745a78ca579f08dcbefd9fbe6274d02))
- **directive:** Safely access component outlet instance ([6c086d8](https://github.com/gund/ng-dynamic-component/commit/6c086d8c47590bd22b6c4e34493b1f988b4f712c))
- **directive:** Update differ usage according to angular 5 ([eab9ecd](https://github.com/gund/ng-dynamic-component/commit/eab9ecd9c428a9082934db744a1dea615719a5cb))
- **package:** Add tslib to peer dependencies ([b27eecd](https://github.com/gund/ng-dynamic-component/commit/b27eecd4ac5c280647cb2a670ab9aeffe527e144))
- **package:** Add typings property ([1650a17](https://github.com/gund/ng-dynamic-component/commit/1650a17ebcdc1b50d6ecd0f9a422e3855765c68a))
- **package:** Include src directory to published package ([057f7b9](https://github.com/gund/ng-dynamic-component/commit/057f7b93ec3e0d14990ca3a4ba98099bc701eaa1))
- **package:** Remove src folder from published package ([570ca6e](https://github.com/gund/ng-dynamic-component/commit/570ca6e745e6c10f9fa05f9c9dd6cdddcca947e7))
- **package:** Unlock angular versions ([22d4563](https://github.com/gund/ng-dynamic-component/commit/22d45630a4a72a5938cfeae573938dbc421b8c5f))
- **strictNullChecks:** Comply with strict null checks mode ([0adda4a](https://github.com/gund/ng-dynamic-component/commit/0adda4af81ef93cd27b8e83011f6807982d357aa))

### Features

- **dynamic-directive:** Add support for \* syntax with ngComponentOutlet directive ([2e8b2f9](https://github.com/gund/ng-dynamic-component/commit/2e8b2f93457efb23f126357015befb66883440dd)), closes [#43](https://github.com/gund/ng-dynamic-component/issues/43) [#42](https://github.com/gund/ng-dynamic-component/issues/42)
- **release:** Update docs and introduce breaking change for major version increment ([61aae93](https://github.com/gund/ng-dynamic-component/commit/61aae93e0a7190ee977ad7240df37ab03e2f25ac))

### BREAKING CHANGES

- **build:** The structure of published packaged changed, but it should not affect public APIs
- **release:** Upgrade to Angular 4

## [0.0.4](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.3...v0.0.4) (2017-02-18)

### Bug Fixes

- **directive:** Small improvement due to unit tests ([644fdda](https://github.com/gund/ng-dynamic-component/commit/644fdda6cb86ede4158069a3ccc9fe32fca13584))

## [0.0.3](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.2...v0.0.3) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive ti work without Dynamic component ([0432d4a](https://github.com/gund/ng-dynamic-component/commit/0432d4ad94b8bae7cd6059500263c37056f20f2b))

# [1.0.0-beta.4](https://github.com/gund/ng-dynamic-component/compare/v0.0.4...1.0.0-beta.4) (2017-02-18)

### Bug Fixes

- **updates:** Commits from v0.0.4 ([aa99da1](https://github.com/gund/ng-dynamic-component/commit/aa99da1a04b5ce4eb4d380cc7f7d40885a52196a))

# [1.0.0-beta.3](https://github.com/gund/ng-dynamic-component/compare/v0.0.3...1.0.0-beta.3) (2017-02-16)

# [1.0.0-beta.2](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive selector to work without Dynamic component ([8531365](https://github.com/gund/ng-dynamic-component/commit/85313653bf68bafc328d6dc598fe89c916ee76c9))

# [1.0.0-beta.1](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.0...1.0.0-beta.1) (2017-02-16)

### Features

- **directive:** Add support for `NgComponentOutlet` ([6acd8b1](https://github.com/gund/ng-dynamic-component/commit/6acd8b1b5cfd535a650c51f134921e430672f0d8))

# [1.0.0-beta.0](https://github.com/gund/ng-dynamic-component/compare/v0.0.2...1.0.0-beta.0) (2017-02-16)

### Bug Fixes

- **directive:** Fix breaking changes in Dynamic directive ([0eca84a](https://github.com/gund/ng-dynamic-component/commit/0eca84a385622d26123c32782fc2bd8c2e6d799c))

## [0.0.4](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.3...v0.0.4) (2017-02-18)

### Bug Fixes

- **directive:** Small improvement due to unit tests ([644fdda](https://github.com/gund/ng-dynamic-component/commit/644fdda6cb86ede4158069a3ccc9fe32fca13584))

## [0.0.3](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.2...v0.0.3) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive ti work without Dynamic component ([0432d4a](https://github.com/gund/ng-dynamic-component/commit/0432d4ad94b8bae7cd6059500263c37056f20f2b))

# [1.0.0-beta.3](https://github.com/gund/ng-dynamic-component/compare/v0.0.3...1.0.0-beta.3) (2017-02-16)

# [1.0.0-beta.2](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive selector to work without Dynamic component ([8531365](https://github.com/gund/ng-dynamic-component/commit/85313653bf68bafc328d6dc598fe89c916ee76c9))

# [1.0.0-beta.1](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.0...1.0.0-beta.1) (2017-02-16)

### Features

- **directive:** Add support for `NgComponentOutlet` ([6acd8b1](https://github.com/gund/ng-dynamic-component/commit/6acd8b1b5cfd535a650c51f134921e430672f0d8))

# [1.0.0-beta.0](https://github.com/gund/ng-dynamic-component/compare/v0.0.2...1.0.0-beta.0) (2017-02-16)

### Bug Fixes

- **directive:** Fix breaking changes in Dynamic directive ([0eca84a](https://github.com/gund/ng-dynamic-component/commit/0eca84a385622d26123c32782fc2bd8c2e6d799c))

## [0.0.3](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.2...v0.0.3) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive ti work without Dynamic component ([0432d4a](https://github.com/gund/ng-dynamic-component/commit/0432d4ad94b8bae7cd6059500263c37056f20f2b))

# [1.0.0-beta.2](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-02-16)

### Bug Fixes

- **directive:** Fix Dynamic directive selector to work without Dynamic component ([8531365](https://github.com/gund/ng-dynamic-component/commit/85313653bf68bafc328d6dc598fe89c916ee76c9))

# [1.0.0-beta.1](https://github.com/gund/ng-dynamic-component/compare/1.0.0-beta.0...1.0.0-beta.1) (2017-02-16)

### Features

- **directive:** Add support for `NgComponentOutlet` ([6acd8b1](https://github.com/gund/ng-dynamic-component/commit/6acd8b1b5cfd535a650c51f134921e430672f0d8))

# [1.0.0-beta.0](https://github.com/gund/ng-dynamic-component/compare/v0.0.2...1.0.0-beta.0) (2017-02-16)

### Bug Fixes

- **directive:** Fix breaking changes in Dynamic directive ([0eca84a](https://github.com/gund/ng-dynamic-component/commit/0eca84a385622d26123c32782fc2bd8c2e6d799c))

## 0.0.2 (2017-02-16)
