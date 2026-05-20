from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

_llm_nano = ChatOpenAI(temperature=0.1, model_name="gpt-5.4-nano")
_llm_mini = ChatOpenAI(temperature=0.1, model_name="gpt-5.4-mini")

def get_llm_nano():
    return _llm_nano

def get_llm_mini():
    return _llm_mini