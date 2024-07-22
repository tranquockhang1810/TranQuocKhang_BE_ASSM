const express = require("express");
const router = express.Router();
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const auth = require("../../middleware/auth");
const { getProductGraphQL } = require("../../controllers/ProductControllers");

// Định nghĩa schema
const schema = buildSchema(`
  type Query {
    products(page: Int, limit: Int, sortBy: String): ProductResponse
  }

  type Product {
    _id: ID
    name: String!
    price: Int!
    createdAt: String
    updatedAt: String
    category: Category
    description: String
    images: [String]
    status: String
    variants: [Variant]
  }

  type Category {
    _id: ID
    name: String
    code: String
  }

  type Variant {
    size: String
    color: [Color]
    quantity: Int
  }

  type Color {
    name: String
    code: String
    quantity: Int
  }

  type ProductResponse {
    data: [Product]
    paging: Paging
    message: String
  }
   
  type Paging {
    total: Int
    limit: Int
    page: Int
  }
`);

// Định nghĩa resolver
const root = {
  products: async (parent) => {
    return await getProductGraphQL(parent.page, parent.limit, parent.sortBy);
  },
};

// Định nghĩa route
/**
 * @swagger
 * /graphql:
 *   post:
 *     summary: Returns a list of products
 *     tags: [Products]
 *     security:
 *        - bearerAuth: []
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                query:
 *                  type: string
 *                  description: GraphQL query or mutation
 *                variables:
 *                  type: object
 *                  additionalProperties: true
 *                  description: GraphQL variables
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post("/", auth, graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

module.exports = router