import React from 'react'
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { expect, it } from "@jest/globals";

import Authors from "../src/components/Authors";
import { ALLAUTHORS } from '../src/components/queries';

const mocks = [
  {
    request: {
      query: ALLAUTHORS,
      variables: {}
    },
    result: {
      data: {
        allAuthors: [
          {
            "name": "Victor Hugo",
            "booksN": 1,
            "born": null,
          },
          {
            "name": "Fyodor Dostoevsky",
            "booksN": 3,
            "born": 1800,
          },
        ]
      }
    }
  }
];

it("renders without error", async () => {
  render(
    <MockedProvider mocks={mocks}>
      <Authors show={true}/>
    </MockedProvider>
  );
  expect(await screen.findByText("Fyodor Dostoevsky")).toBeInTheDocument();
});
