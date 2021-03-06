/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLResolveInfo
} from 'graphql';

type PluralIdentifyingRootFieldConfig = {
  argName: string,
  inputType: GraphQLInputType,
  outputType: GraphQLOutputType,
  resolveSingleInput: (
    input: any,
    context: any,
    info: GraphQLResolveInfo
  ) => ?any,
  description?: ?string,
};

export function pluralIdentifyingRootField(
  config: PluralIdentifyingRootFieldConfig
): GraphQLFieldConfig<*, *> {
  const inputArgs = {};
  let inputType = config.inputType;
  if (inputType instanceof GraphQLNonNull) {
    inputType = inputType.ofType;
  }
  inputArgs[config.argName] = {
    type: new GraphQLNonNull(
      new GraphQLList(
        new GraphQLNonNull(
          inputType
        )
      )
    )
  };
  return {
    description: config.description,
    type: new GraphQLList(config.outputType),
    args: inputArgs,
    resolve(obj, args, context, info) {
      const inputs = args[config.argName];
      return Promise.all(inputs.map(
        input => Promise.resolve(
          config.resolveSingleInput(input, context, info)
        )
      ));
    }
  };
}
