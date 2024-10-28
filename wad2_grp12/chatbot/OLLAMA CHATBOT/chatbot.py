from langchain_core.prompts import ChatPromptTemplate
from langchain_community.llms import Ollama
import streamlit as st

prompt=ChatPromptTemplate.from_messages(
    [
        ("system","You are a chemistry teacher with a good knowledge base. Please respond to the questions in a manner that is easy for secondary school students to understand"),
        ("user","Question:{question}")
    ]
)

st.title('Elemental Heroes Chatbot with LLAMA3 model')
input_text=st.text_input("Ask your question!")

llm = Ollama(model="llama3")

chain=prompt|llm

if input_text:
    st.write(chain.invoke({"question":input_text}))